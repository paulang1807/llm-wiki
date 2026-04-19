## Virtual Environments
- Requires an active python environment installed on the system
- Packages installed in the virtual environment will not affect the global Python installation 
- Virtualenv does not create every file needed to get a whole new python environment
    - Uses links to global environment files instead in order to save disk space end speed up your virtualenv. 

### Using Inbuilt Python "venv"
```bash
# create the environment
# python -m venv <virtual_env_name>
python -m venv my-venv
# The above creates a folder with the name of the virtual environment
# The directory is created in the location from where the above command is run and contains all relevant folders and files for the virtual environment

# Activate the environment
source my-venv/bin/activate
# Deactivate the environment
deaactivate

# Remove an env 
# Delete the virtual env folder
rm -r my-venv
```

### Using virtualenv
```bash
# Install virtualenv
pip install virtualenv

# create the environment
# virtualenv <path_to_virtual_env_folder>
virtualenv ./my-venv
# The above creates a folder with the name of the virtual environment

# Activate the environment
source ./my-venv/bin/activate
# Deactivate the environment
deaactivate
```

### Using [Anaconda](https://www.anaconda.com/products/distribution)
```bash
# Create the environment
# conda create -n <virtual_env_name> <space separated package names to be installed>
conda create -n my-venv python=3 matplotlib
# The above creates a folder with the name of the virtual environment
# The directory is created under anaconda/envs folder and contains all relevant folders and files for the virtual environment

# Activate the environment
source activate my-venv
# Deactivate the environment
conda deaactivate

# View all environments
conda env list 
conda info --envs

# View all packages in an environment that is inactive
conda list -n mids-venv
# View all packages in an environment that is active
conda list 

# Clone an env
conda create --name my-clone --clone my-venv
# Clone the base
conda create --name my-clone --clone base

# Remove an env 
conda remove --name myenv --all
conda env remove -n myenv
```

??? tip "Install Packages with requirements.txt"
    - Create a file called requirements.txt and add all the package names in that file
    - Install packages
        ```bash
        pip install -r requirements.txt
        ```

### Using [uv](https://docs.astral.sh/uv/)

- Instead of `pip install xxx` use `uv add xxx`
- No need to activate environments - `uv` handles it automatically.
- Instead of `python xxx` use `uv run xxx`

```bash
# Create a new project (creates a new folder)
uv init <project_name>
cd <project_name>
uv sync

# Initialize in an existing project folder
uv init

# Check version
uv --version

# Update uv
uv self update
```

!!! info "Virtual Environments"
    `uv` will create a virtual environment and `uv.lock` file in the root of your project the first time you run a project command (e.g., `uv run`, `uv sync`, or `uv lock`)
    - All relevant virtual environment files are stored in the `.venv` folder

??? tip "Install Packages with requirements.txt"
    ```bash
    # Add all dependencies from requirements.txt
    uv add -r requirements.txt -c constraints.txt
    ```

??? tip "Intel macOS Compatibility"
    Add the following to require that the project supports Intel macOS. This setting is only relevant for packages that do not publish a source distribution (like PyTorch), as such packages can only be installed on environments covered by the set of pre-built binary distributions (wheels) published by that package.

    ```toml
    [tool.uv]
    required-environments = [
        "sys_platform == 'darwin' and platform_machine == 'x86_64'",
    ]
    ```

