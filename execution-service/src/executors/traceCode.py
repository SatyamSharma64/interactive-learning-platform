import sys
import json
import traceback
from types import FrameType
from typing import Any, Dict, List

execution_steps: List[Dict[str, Any]] = []
original_code_lines = """def two_sum(nums, target):
    \"\"\"
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    \"\"\"
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i""".split('\n')

def trace_calls(frame: FrameType, event: str, arg: Any) -> Any:
    if event == 'line' and frame.f_code.co_filename == '<string>':
        line_no = frame.f_lineno

        # Skip our tracing setup lines
        if line_no <= len(original_code_lines):
            variables = {
                k: v for k, v in frame.f_locals.items()
                if not k.startswith('__') and k not in ['trace_calls', 'execution_steps', 'original_code_lines']
            }

            serialized_vars = {}
            for k, v in variables.items():
                try:
                    if isinstance(v, (int, float, str, bool, type(None))):    
                        serialized_vars[k] = v
                    elif isinstance(v, (list, tuple)):
                        serialized_vars[k] = list(v)
                    elif isinstance(v, dict):
                        serialized_vars[k] = dict(v)
                    else:
                        serialized_vars[k] = str(v)
                except:
                    serialized_vars[k] = str(v)

            call_stack = []
            current_frame = frame
            while current_frame and len(call_stack) < 10:
                if current_frame.f_code.co_filename == '<string>':
                    func_name = current_frame.f_code.co_name
                    if func_name != '<module>' and func_name != 'trace_calls':
                        call_stack.append(f"{func_name}()")
                current_frame = current_frame.f_back

            try:
                line_content = original_code_lines[line_no - 1].strip()       
                description = f"Executing: {line_content}"
            except:
                description = f"Executing line {line_no}"

            step = {
                'lineNumber': line_no,
                'variables': serialized_vars,
                'callStack': call_stack[::-1],
                'description': description
            }

            execution_steps.append(step)

    return trace_calls

sys.settrace(trace_calls)

import io
from contextlib import redirect_stdout
output_buffer = io.StringIO()

try:
    with redirect_stdout(output_buffer):
        def two_sum(nums, target):
            """
            :type nums: List[int]
            :type target: int
            :rtype: List[int]
            """
            seen = {}
            for i, num in enumerate(nums):
                complement = target - num
                if complement in seen:
                    return [seen[complement], i]
                seen[num] = i
except Exception as e:
    execution_steps.append({
        'lineNumber': -1,
        'variables': {},
        'callStack': [],
        'description': f"Error: {str(e)}",
        'output': str(e)
    })

output = output_buffer.getvalue()
if output and execution_steps:
    execution_steps[-1]['output'] = output

print("TRACE_START")
print(json.dumps(execution_steps))
print("TRACE_END")