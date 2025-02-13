# BAML Python Integration Tests

> **⚠️ IMPORTANT NOTE**
>
> This document was initially generated by an AI assistant and should be taken with a grain of salt. While it provides a good starting point, some information might be inaccurate or outdated. We encourage contributors to manually update this document and remove this note once the content has been verified and corrected by the team.
>
> If you find any inaccuracies or have improvements to suggest, please feel free to submit a PR updating this guide.

This directory contains integration tests for the BAML Python client. These tests verify the functionality of the Python client library and ensure it works correctly with various BAML features.

## Prerequisites

- Python 3.8 or higher
- Poetry package manager
- BAML CLI installed
- Infisical CLI installed
- Rust toolchain (for building the Python client)

## Setup

1. Install Poetry dependencies:
```bash
poetry install
```

2. Build and install the Python client:
```bash
# Note: env -u CONDA_PREFIX is needed if you're using Conda to avoid conflicts
env -u CONDA_PREFIX poetry run maturin develop --manifest-path ../../engine/language_client_python/Cargo.toml
```

3. Generate the BAML client code:
```bash
poetry run baml-cli generate --from ../baml_src
```

## Running Tests

### Run all tests
```bash
infisical run --env=test -- poetry run pytest
```

### Run specific tests
```bash
# Run tests in a specific file
infisical run --env=test -- poetry run pytest tests/test_functions.py

# Run a specific test
infisical run --env=test -- poetry run pytest tests/test_functions.py -k "test_name"
```

### Environment Variables
- Tests can be run with environment variables using `infisical` (default)
```bash
infisical run --env=test -- poetry run pytest
```

- Alternatively, you can use a .env file:
```bash
poetry run pytest
```

### CI Environment
For CI environments, use:
```bash
infisical run --env=test -- poetry run pytest --no-cov
```

## Project Structure

- `tests/` - Test files
- `baml_client/` - Generated BAML client code
- `app/` - Example application code
- `docker-tests/` - Docker-based integration tests
- `pyproject.toml` - Python project configuration
- `poetry.lock` - Locked dependencies

## Debugging Tests

### VS Code Setup
1. Install the [Python Test Explorer](https://marketplace.visualstudio.com/items?itemName=LittleFoxTeam.vscode-python-test-adapter) extension for VS Code
   - This provides inline test running and debugging capabilities
   - Adds "Run Test" and "Debug Test" buttons above each test

2. Create a launch configuration in `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "python",
      "request": "launch",
      "runtimeExecutable": "infisical",
      "runtimeArgs": [
        "run",
        "--env=test",
        "--"
      ],
      "program": "${workspaceFolder}/.venv/bin/pytest",
      "args": [
        "-v",
        "-s"
      ],
      "console": "integratedTerminal",
      "justMyCode": false
    }
  ]
}
```

3. Set breakpoints in your test files
4. Use the VS Code debugger to run and debug tests, or use the Test Explorer's inline buttons

### Debug Logs
- Add `print()` statements in your tests
- Use the `-s` flag to show print statements:
```bash
infisical run --env=test -- poetry run pytest -s
```
- Set the environment variable `BAML_LOG=trace` for detailed BAML client logs:
```bash
BAML_LOG=trace infisical run --env=test -- poetry run pytest
```

## Troubleshooting

### Common Issues

1. **Missing API Keys**
   - Ensure all required API keys are set in your environment
   - Check that `.env` file exists if not using Infisical
   - Verify Infisical is properly configured if using `infisical run`

2. **Build Issues**
   - If you get Rust/Maturin errors:
     ```bash
     # Clean and rebuild
     rm -rf target/
     env -u CONDA_PREFIX poetry run maturin develop --manifest-path ../../engine/language_client_python/Cargo.toml
     ```
   - For Poetry issues:
     ```bash
     poetry install --sync
     ```

3. **Test Timeouts**
   - Default timeout can be adjusted using pytest timeout markers:
     ```python
     @pytest.mark.timeout(60)
     def test_long_running():
         ...
     ```

4. **BAML Client Generation Issues**
   - Ensure BAML CLI is up to date
   - Check that BAML source files in `../baml_src` are valid
   - Try regenerating the client:
     ```bash
     rm -rf baml_client
     poetry run baml-cli generate --from ../baml_src
     ```

5. **Conda Environment Conflicts**
   - If using Conda, always use `env -u CONDA_PREFIX` when running maturin commands
   - Consider creating a separate non-Conda environment for development

### Getting Help
- Use pytest's verbose mode for more details:
  ```bash
  infisical run --env=test -- poetry run pytest -v
  ```
- Enable print statement output:
  ```bash
  infisical run --env=test -- poetry run pytest -s
  ```
- Check the pytest output for error tracebacks and assertion details

## Adding New Tests

### 1. Define BAML Files
First, add your test definitions in the BAML source files (see [BAML Source README](../baml_src/README.md)):
1. Add clients in `baml_src/clients.baml`
2. Add functions and tests in `baml_src/test-files/providers/`

### 2. Generate Python Client
```bash
poetry run baml-cli generate --from ../baml_src
```
This will create new Python client code in `baml_client/`.

### 3. Create Test File
Create a new test file in `tests/` directory:
```python
import pytest
from baml_client.functions import TestAnthropicCompletion

class TestAnthropic:
    @pytest.mark.asyncio
    async def test_basic_completion(self):
        result = await TestAnthropicCompletion(
            input="What is the capital of France?"
        )
        assert result == "Paris"

    @pytest.mark.asyncio
    async def test_error_handling(self):
        with pytest.raises(Exception):
            await TestAnthropicCompletion(
                input="Test input"
            )
```

### 4. Run Your Tests
```bash
# Run all tests
infisical run --env=test -- poetry run pytest

# Run specific test file
infisical run --env=test -- poetry run pytest tests/test_anthropic.py

# Run specific test
infisical run --env=test -- poetry run pytest tests/test_anthropic.py -k "test_basic_completion"
```

### Test File Organization
- Group related tests in classes
- Name test files with `test_` prefix
- Place tests in the `tests/` directory
- Use descriptive test names

### Best Practices
1. **Test Setup**
   - Import functions from `baml_client`
   - Use pytest fixtures for common setup
   - Add proper error handling tests
   - Use `@pytest.mark.asyncio` for async tests

2. **Assertions**
   - Use pytest assertions
   - Test both success and error cases
   - Add timeout for long-running tests:
     ```python
     @pytest.mark.timeout(30)
     @pytest.mark.asyncio
     async def test_long_running():
         ...
     ```

3. **Environment**
   - Ensure all required env vars are set
   - Use test-specific API keys
   - Handle rate limiting appropriately