// Template Management Service

interface CodeTemplate {
  id: string;
  problemId: string;
  languageId: string;
  templateCode: string;
  starterCode?: string | null;
  helperCode?: string | null;
  imports?: string | null;
  mainFunction: string | null;
  testRunnerCode: string | null;
  inputParser: string;
  outputFormatter: string;
  functionName: string;
  parameters: ParameterType[];
}

interface ParameterType {
  id: string;
  templateId: string;
  name: string;
  type: 'int' | 'float' | 'string' | 'list_int' | 'list_float' | 'list_string' | 'matrix_int' | 'custom';
  description: string;
  parser?: string | null;
  orderIndex: number;
}

export class CodeTemplateService {
  // private prisma: PrismaClient;

  // constructor(prisma: PrismaClient) {
  //   this.prisma = prisma;
  // }

  buildFullScript(template: CodeTemplate, userCode: string): string {
    
    return `${template.imports || ''}

${template.helperCode || ''}

${userCode}

${template.mainFunction}

${template.testRunnerCode || ''}`;
  }

// return `${template.imports || ''}

// ${template.helperCode || ''}

// ${userCode}

// ${template.inputParser}

// ${template.outputFormatter}

// ${template.mainFunction}

// ${template.testRunnerCode || ''}`;


//   // Get template for a specific problem and language
//   async getTemplate(problemId: string, languageId: string): Promise<CodeTemplate | null> {
//     const template = await this.prisma.codeTemplate.findUnique({
//       where: {
//         problemId_languageId: {
//           problemId,
//           languageId
//         }
//       },
//       include: {
//         templateParameters: {
//           orderBy: { orderIndex: 'asc' }
//         }
//       }
//     });

//     if (!template) return null;

//     return {
//       id: template.id,
//       problemId: template.problemId,
//       languageId: template.languageId,
//       templateCode: template.templateCode,
//       starterCode: template.starterCode || undefined,
//       helperCode: template.helperCode || undefined,
//       imports: template.imports || undefined,
//       mainFunction: template.mainFunction,
//       testRunnerCode: template.testRunnerCode,
//       inputParser: template.inputParser,
//       outputFormatter: template.outputFormatter,
//       functionName: template.functionName,
//       parameterTypes: template.templateParameters.map(param => ({
//         name: param.name,
//         type: param.type as any,
//         description: param.description,
//         parser: param.parser || undefined,
//         position: param.position
//       }))
//     };
//   }

//   // Create or update a template
//   async saveTemplate(template: CodeTemplate): Promise<void> {
//     await this.prisma.$transaction(async (tx) => {
//       // Upsert the main template
//       await tx.codeTemplate.upsert({
//         where: {
//           problemId_languageId: {
//             problemId: template.problemId,
//             languageId: template.languageId
//           }
//         },
//         update: {
//           templateCode: template.templateCode,
//           starterCode: template.starterCode,
//           helperCode: template.helperCode,
//           imports: template.imports,
//           mainFunction: template.mainFunction,
//           testRunnerCode: template.testRunnerCode,
//           inputParser: template.inputParser,
//           outputFormatter: template.outputFormatter,
//           functionName: template.functionName,
//           updatedAt: new Date()
//         },
//         create: {
//           id: template.id,
//           problemId: template.problemId,
//           languageId: template.languageId,
//           templateCode: template.templateCode,
//           starterCode: template.starterCode,
//           helperCode: template.helperCode,
//           imports: template.imports,
//           mainFunction: template.mainFunction,
//           testRunnerCode: template.testRunnerCode,
//           inputParser: template.inputParser,
//           outputFormatter: template.outputFormatter,
//           functionName: template.functionName
//         }
//       });

//       // Delete existing parameters
//       await tx.templateParameter.deleteMany({
//         where: { templateId: template.id }
//       });

//       // Create new parameters
//       if (template.parameterTypes.length > 0) {
//         await tx.templateParameter.createMany({
//           data: template.parameterTypes.map(param => ({
//             id: `${template.id}_param_${param.position}`,
//             templateId: template.id,
//             name: param.name,
//             type: param.type,
//             description: param.description,
//             parser: param.parser,
//             position: param.position
//           }))
//         });
//       }
//     });
//   }

//   // Generate template for common problem patterns
//   async generateTemplate(config: {
//     problemId: string;
//     languageId: string;
//     functionName: string;
//     parameters: Omit<ParameterType, 'position'>[];
//     returnType: string;
//     inputFormat: string;
//     customInputParser?: string;
//   }): Promise<CodeTemplate> {
    
//     const { problemId, languageId, functionName, parameters, returnType, inputFormat, customInputParser } = config;
    
//     // Add positions to parameters
//     const parametersWithPosition = parameters.map((param, index) => ({
//       ...param,
//       position: index + 1
//     }));
    
//     const template: CodeTemplate = {
//       id: `${problemId}_${languageId}_generated`,
//       problemId,
//       languageId,
//       templateCode: this.generateFunctionSignature(functionName, parametersWithPosition, returnType),
//       imports: this.generateImports(parametersWithPosition, returnType),
//       inputParser: customInputParser || this.generateInputParser(parametersWithPosition, inputFormat),
//       outputFormatter: this.generateOutputFormatter(returnType),
//       mainFunction: this.generateMainFunction(functionName, parametersWithPosition),
//       testRunnerCode: 'if __name__ == "__main__":\n    main()',
//       functionName,
//       parameterTypes: parametersWithPosition
//     };

//     return template;
//   }

//   private generateFunctionSignature(functionName: string, parameters: ParameterType[], returnType: string): string {
//     const paramNames = parameters.map(p => p.name).join(', ');
//     const docstring = this.generateDocstring(parameters, returnType);
    
//     return `def ${functionName}(${paramNames}):
//     """${docstring}"""
//     # Your solution here
//     pass`;
//   }

//   private generateDocstring(parameters: ParameterType[], returnType: string): string {
//     const paramDocs = parameters.map(p => `    :type ${p.name}: ${this.getTypeAnnotation(p.type)}`).join('\n');
//     return `\n${paramDocs}\n    :rtype: ${returnType}\n    `;
//   }

//   private getTypeAnnotation(type: string): string {
//     const typeMap = {
//       'int': 'int',
//       'float': 'float',
//       'string': 'str', 
//       'list_int': 'List[int]',
//       'list_float': 'List[float]',
//       'list_string': 'List[str]',
//       'matrix_int': 'List[List[int]]',
//       'custom': 'Any'
//     };
//     return typeMap[type as keyof typeof typeMap] || 'Any';
//   }

//   private generateImports(parameters: ParameterType[], returnType: string): string {
//     let imports = 'import sys';
    
//     // Check if we need typing imports
//     const needsTyping = parameters.some(p => p.type.startsWith('list_') || p.type === 'matrix_int');
//     if (needsTyping) {
//       imports += '\nfrom typing import List, Optional, Any';
//     }
    
//     // Check if we need json for complex parsing/formatting
//     const needsJson = parameters.some(p => p.type === 'matrix_int' || p.type === 'custom') || 
//                      returnType.includes('List') || returnType.includes('Array');
//     if (needsJson) {
//       imports += '\nimport json';
//     }
    
//     return imports;
//   }

//   private generateInputParser(parameters: ParameterType[], inputFormat: string): string {
//     // Generate parser based on parameter types
//     if (parameters.length === 1) {
//       return this.generateSingleParameterParser(parameters[0]);
//     } else if (parameters.length === 2) {
//       return this.generateTwoParameterParser(parameters[0], parameters[1]);
//     } else {
//       return this.generateMultiParameterParser(parameters);
//     }
//   }

//   private generateSingleParameterParser(param: ParameterType): string {
//     switch (param.type) {
//       case 'int':
//         return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     return [(int(line.strip()),) for line in lines if line.strip()]`;
      
//       case 'string':
//         return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     return [(line.strip(),) for line in lines if line.strip()]`;
      
//       case 'list_int':
//         return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
//     for line in lines:
//         if line.strip():
//             nums = list(map(int, line.split()))
//             test_cases.append((nums,))
//     return test_cases`;
      
//       case 'matrix_int':
//         return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
//     for line in lines:
//         if line.strip():
//             try:
//                 matrix = json.loads(line)
//                 test_cases.append((matrix,))
//             except json.JSONDecodeError:
//                 print(f"Error parsing matrix: {line}")
//     return test_cases`;
      
//       default:
//         return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     return [(line.strip(),) for line in lines if line.strip()]`;
//     }
//   }

//   private generateTwoParameterParser(param1: ParameterType, param2: ParameterType): string {
//     // Common pattern: array + target
//     if (param1.type === 'list_int' && param2.type === 'int') {
//       return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
    
//     i = 0
//     while i < len(lines):
//         if i + 1 < len(lines):
//             try:
//                 nums = list(map(int, lines[i].split()))
//                 target = int(lines[i + 1])
//                 test_cases.append((nums, target))
//                 i += 2
//             except ValueError as e:
//                 print(f"Error parsing at lines {i}, {i+1}: {e}")
//                 break
//         else:
//             break
    
//     return test_cases`;
//     }
    
//     // Matrix + target
//     if (param1.type === 'matrix_int' && param2.type === 'int') {
//       return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
    
//     i = 0
//     while i < len(lines):
//         if i + 1 < len(lines):
//             try:
//                 matrix = json.loads(lines[i])
//                 target = int(lines[i + 1])
//                 test_cases.append((matrix, target))
//                 i += 2
//             except (json.JSONDecodeError, ValueError) as e:
//                 print(f"Error parsing at lines {i}, {i+1}: {e}")
//                 break
//         else:
//             break
    
//     return test_cases`;
//     }
    
//     // Generic two parameter parser
//     return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
    
//     i = 0
//     while i < len(lines):
//         if i + 1 < len(lines):
//             param1 = lines[i].strip()
//             param2 = lines[i + 1].strip()
//             test_cases.append((param1, param2))
//             i += 2
//         else:
//             break
    
//     return test_cases`;
//   }

//   private generateMultiParameterParser(parameters: ParameterType[]): string {
//     return `def parse_input(input_str):
//     """Parse input string into function parameters"""
//     lines = input_str.strip().split('\\n')
//     test_cases = []
    
//     # Multi-parameter parsing - customize based on your input format
//     param_count = ${parameters.length}
//     i = 0
//     while i + param_count - 1 < len(lines):
//         params = []
//         for j in range(param_count):
//             params.append(lines[i + j].strip())
//         test_cases.append(tuple(params))
//         i += param_count
    
//     return test_cases`;
//   }

//   private generateOutputFormatter(returnType: string): string {
//     if (returnType.includes('List') || returnType.includes('Array') || returnType.includes('[')) {
//       return `def format_output(result):
//     """Format function result for output"""
//     import json
//     return json.dumps(result)`;
//     } else if (returnType.toLowerCase().includes('bool')) {
//       return `def format_output(result):
//     """Format function result for output"""
//     return str(result).lower()`;
//     } else {
//       return `def format_output(result):
//     """Format function result for output"""
//     return str(result)`;
//     }
//   }

//   private generateMainFunction(functionName: string, parameters: ParameterType[]): string {
//     const paramNames = parameters.map(p => p.name).join(', ');
    
//     return `def main():
//     """Main execution function"""
//     try:
//         input_data = sys.stdin.read().strip()
//         if not input_data:
//             print("No input provided")
//             return
        
//         test_cases = parse_input(input_data)
        
//         if not test_cases:
//             print("No valid test cases found")
//             return
        
//         for i, (${paramNames}) in enumerate(test_cases):
//             try:
//                 result = ${functionName}(${paramNames})
//                 formatted_result = format_output(result)
//                 print(f"Test case {i + 1}: {formatted_result}")
//             except Exception as e:
//                 print(f"Error in test case {i + 1}: {str(e)}")
//                 import traceback
//                 traceback.print_exc()
        
//         print(f"\\nExecuted {len(test_cases)} test cases")
        
//     except Exception as e:
//         print(f"Execution error: {str(e)}")
//         import traceback
//         traceback.print_exc()
//         sys.exit(1)`;
//   }

//   // Get all templates for a problem
//   async getTemplatesForProblem(problemId: string): Promise<CodeTemplate[]> {
//     const templates = await this.prisma.codeTemplate.findMany({
//       where: { problemId },
//       include: {
//         templateParameters: {
//           orderBy: { position: 'asc' }
//         }
//       }
//     });

//     return templates.map(template => ({
//       id: template.id,
//       problemId: template.problemId,
//       languageId: template.languageId,
//       templateCode: template.templateCode,
//       starterCode: template.starterCode || undefined,
//       helperCode: template.helperCode || undefined,
//       imports: template.imports || undefined,
//       mainFunction: template.mainFunction,
//       testRunnerCode: template.testRunnerCode,
//       inputParser: template.inputParser,
//       outputFormatter: template.outputFormatter,
//       functionName: template.functionName,
//       parameterTypes: template.templateParameters.map(param => ({
//         name: param.name,
//         type: param.type as any,
//         description: param.description,
//         parser: param.parser || undefined,
//         position: param.position
//       }))
//     }));
//   }

//   // Delete a template
//   async deleteTemplate(problemId: string, languageId: string): Promise<void> {
//     await this.prisma.codeTemplate.delete({
//       where: {
//         problemId_languageId: {
//           problemId,
//           languageId
//         }
//       }
//     });
//   }

//   // Validate template by testing it
//   async validateTemplate(template: CodeTemplate, testInput: string, expectedOutput: string): Promise<{
//     valid: boolean;
//     error?: string;
//     actualOutput?: string;
//   }> {
//     try {
//       // This would integrate with your execution service
//       const fullScript = this.buildFullScript(template, 'pass  # placeholder');
      
//       // You would call your execution service here
//       // const result = await executionService.execute({
//       //   code: fullScript,
//       //   language: 'python',
//       //   input: testInput
//       // });
      
//       // For now, return a mock validation
//       return {
//         valid: true,
//         actualOutput: expectedOutput
//       };
      
//     } catch (error: any) {
//       return {
//         valid: false,
//         error: error.message
//       };
//     }
//   }

}

export const templateService = new CodeTemplateService();