import dockerode from 'dockerode';

export interface ExecutionResult {
  success: boolean;
  output: string[];
  errors: string[];
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit: number;
  memoryLimit: number;
}

export abstract class BaseExecutor {
  private static pulledImages = new Set<string>();
  
  abstract execute(request: ExecutionRequest): Promise<ExecutionResult>;
  
  protected async ensureImageExists(docker: dockerode, image: string): Promise<void> {
    // Check if we've already pulled this image in this session
    if (BaseExecutor.pulledImages.has(image)) {
      return;
    }

    try {
      // Check if image exists locally
      await docker.getImage(image).inspect();
      BaseExecutor.pulledImages.add(image);
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log(`Pulling Docker image: ${image}`);
        
        // Pull the image
        const stream = await docker.pull(image);
        
        // Wait for pull to complete
        await new Promise((resolve, reject) => {
          docker.modem.followProgress(stream, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        
        console.log(`Successfully pulled image: ${image}`);
        BaseExecutor.pulledImages.add(image);
      } else {
        throw error;
      }
    }
  }
  
  protected async runInContainer(
    image: string,
    code: string,
    input: string = '',
    timeLimit: number = 5000,
    memoryLimit: number = 128
  ): Promise<ExecutionResult> {
    const Docker = dockerode;
    const docker = new Docker();
    
    const startTime = Date.now();
    let container: dockerode.Container | null = null;
    
    try {
      // Ensure the Docker image exists
      await this.ensureImageExists(docker, image);
      
      container = await docker.createContainer({
        Image: image,
        Cmd: ['/bin/sh', '-c', code],
        WorkingDir: '/app',
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: !!input,
        OpenStdin: !!input,
        StdinOnce: !!input,
        HostConfig: {
          Memory: memoryLimit * 1024 * 1024,
          CpuQuota: 50000,
          ReadonlyRootfs: false,
          AutoRemove: false, // We'll manually remove to avoid the 409 error
          NetworkMode: 'none',
        },
      });

      await container.start();
      
      // Handle input if provided
      if (input) {
        const stream = await container.attach({
          stream: true,
          stdin: true,
          stdout: false,
          stderr: false,
        });
        stream.write(input);
        stream.end();
      }

      // Wait for container to finish with timeout
      const waitResult = await Promise.race([
        container.wait(),
        new Promise<{ StatusCode: number }>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeLimit)
        ),
      ]);

      // Get logs before removing container
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
      });

      const executionTime = Date.now() - startTime;
      
      // Parse Docker logs (they include headers we need to strip)
      const logString = this.parseDockerLogs(logs);
      const output = logString.split('\n').filter((line: string) => line.trim());
      console.log('Execution output:', output);
      console.log('logs:', logString);
      // Clean up container
      try {
        await container.remove({ force: true });
      } catch (removeError) {
        console.warn('Failed to remove container:', removeError);
      }

      return {
        success: waitResult.StatusCode === 0,
        output: waitResult.StatusCode === 0 ? output : [],
        errors: waitResult.StatusCode !== 0 ? output : [],
        executionTime,
        memoryUsed: 0, // Docker doesn't easily provide this info
        exitCode: waitResult.StatusCode,
      };

    } catch (error: any) {
      // Clean up container on error
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (removeError) {
          console.warn('Failed to remove container after error:', removeError);
        }
      }

      return {
        success: false,
        output: [],
        errors: [error.message === 'Timeout' ? 'Execution timed out' : error.message],
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        exitCode: -1,
      };
    }
  }

  /**
   * Parse Docker logs to remove headers and get clean output
   * Docker multiplexes stdout/stderr with 8-byte headers
   */
  private parseDockerLogs(buffer: Buffer): string {
    let result = '';
    let offset = 0;

    while (offset < buffer.length) {
      // Docker log format: [STREAM_TYPE][3 bytes of zeros][SIZE][DATA]
      if (offset + 8 > buffer.length) break;
      
      const header = buffer.slice(offset, offset + 8);
      const streamType = header[0]; // 1=stdout, 2=stderr
      const size = header.readUInt32BE(4);
      
      if (offset + 8 + size > buffer.length) break;
      
      const data = buffer.slice(offset + 8, offset + 8 + size);
      result += data.toString('utf8');
      
      offset += 8 + size;
    }

    return result;
  }
}