# main.py - FastAPI Backend
from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import shutil
import zipfile
from pathlib import Path
import asyncio
import logging
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Chemistry Experiment Generator")

# Configure CORS to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/projects", StaticFiles(directory="generated_projects"), name="projects")

# Pydantic models for request validation
class ExperimentRequest(BaseModel):
    experiment_name: str
    experiment_description: str
    complexity_level: str = "Intermediate"  # Beginner, Intermediate, Advanced
    target_age_group: str = "High School"  # Middle School, High School, College

class ValidationRequest(BaseModel):
    project_data: dict

# Initialize Gemini API
def initialize_gemini():
    api_key = "AIzaSyBNyfd1fDDckpCzhy4vWJBNRAkx22LHQ5w"
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash')

# Create project directory structure
# def create_project_structure(experiment_name):
#     # Create a sanitized folder name
#     # Change this in create_project_structure function in chemsim.py
#     folder_name = ''.join(c for c in experiment_name if c.isalnum() or c == ' ').replace(' ', '_').lower()
#     base_dir = Path(f"./generated_projects/{folder_name}")
    
#     # Create project directories
#     dirs = {
#         "root": base_dir,
#         "frontend": base_dir / "frontend",
#         "backend": base_dir / "backend",
#         "public": base_dir / "frontend" / "public",
#         "src": base_dir / "frontend" / "src",
#         "components": base_dir / "frontend" / "src" / "components",
#         "styles": base_dir / "frontend" / "src" / "styles",
#         "assets": base_dir / "frontend" / "src" / "assets",
#     }
    
#     # Create directories
#     for dir_path in dirs.values():
#         dir_path.mkdir(parents=True, exist_ok=True)
    
#     return dirs, folder_name

# Generate instruction prompt for Gemini
def get_instruction_prompt(experiment_data):
    return f"""
    I need detailed instructions for building a chemistry experiment simulation website with the following details:
    
    Experiment Name: {experiment_data.experiment_name}
    Description: {experiment_data.experiment_description}
    Complexity Level: {experiment_data.complexity_level}
    Target Age Group: {experiment_data.target_age_group}
    
    The instructions should cover:
    1. How to structure a React frontend for this specific chemistry experiment
    2. How to build a FastAPI backend that can handle the simulation logic
    3. What components and UI elements are needed to represent this experiment
    4. How to visualize the chemistry concepts (molecules, reactions, etc.)
    5. What CSS and styling would be appropriate for this educational purpose
    6. Safety precautions and educational notes to include
    
    Please be detailed and specific to this experiment, not generic website building advice.
    """

# Modify the get_implementation_prompt function to ensure the simulation can run in an iframe
def get_implementation_prompt(experiment_data, instructions):
    return f"""
    Based on these instructions:
    
    {instructions}
    
    Generate the complete code for a chemistry experiment simulation website with React frontend that can run standalone in an iframe (no backend required).
    
    The website should simulate: {experiment_data.experiment_name}
    Description: {experiment_data.experiment_description}
    
    Important requirements:
    1. The application must be a SINGLE PAGE APPLICATION that can run entirely in an iframe
    2. All simulation logic should be handled in the frontend JavaScript
    3. All dependencies must be loaded from CDNs (React, ReactDOM, etc.)
    4. The index.html must load all required scripts and styles
    5. No server-side API calls should be needed - everything must work client-side
    
    Include the following files:
    
    1. Frontend:
       - index.html (with all required CDN scripts)
       - styles.css
       - app.js
       - Any component files needed
       - Any simulation logic files needed
       
    Make sure the simulation is interactive, educational, and visually appealing for {experiment_data.target_age_group} students.
    Provide complete code for each file, not just snippets or placeholders. 
    NOTE: DO NOT GIVE ANYTHING OTHER THAN THE CODE. DO NOT GIVE COMMENTS AS WELL. KEEP EVERYTHING IN ONE SINGULAR HTML FILE FORMAT WITH CSS AND SCRIPT BUILT INTO IT.
    BE AS GRAPHIC AS POSSIBLE FOR THE SIMULATIONS.
    """

# Modify the create_project_structure function to simplify the directory Ce
# def create_project_structure(experiment_name):
#     # Create a sanitized folder name
#     folder_name = "".join(c if c.isalnum() or c in [' ', '_'] else '_' for c in experiment_name).replace(' ', '_').lower()
#     base_dir = Path(f"./generated_projects/{folder_name}")
    
#     # Create project directories
#     dirs = {
#         "root": base_dir,
#         "frontend": base_dir / "frontend",
#         "assets": base_dir / "frontend" / "assets",
#     }
    
#     # Create directories
#     for dir_path in dirs.values():
#         dir_path.mkdir(parents=True, exist_ok=True)
    
#     return dirs, folder_name

def create_project_structure(experiment_name):
    folder_name = "".join(c if c.isalnum() or c in [' ', '_'] else '_' for c in experiment_name).replace(' ', '_').lower()
    base_dir = Path(f"./generated_projects/{folder_name}")
    base_dir.mkdir(parents=True, exist_ok=True)
    return {"root": base_dir}, folder_name

# Generate validation prompt for Gemini
def get_validation_prompt(project_data):
    return f"""
    Validate the following chemistry experiment simulation project for correctness and completeness:
    
    {json.dumps(project_data, indent=2)}
    
    Check for:
    1. Scientific accuracy of the chemistry simulation
    2. Correct React component structure and props
    3. Proper FastAPI backend implementation
    4. Appropriate CSS styling
    5. Complete package dependencies
    6. Any bugs or issues in the code
    
    Provide a detailed analysis of any problems found and suggest specific fixes.
    If the project passes validation, confirm that it's ready for use.
    """

# Save generated files to the project structure
# def save_project_files(project_data, dirs):
#     for file_path, content in project_data.items():
#         # Determine the file's absolute path within the project structure
#         if file_path.startswith("frontend/"):
#             rel_path = file_path[9:]  # Remove 'frontend/' prefix
#             abs_path = dirs["frontend"] / rel_path
#         elif file_path.startswith("backend/"):
#             rel_path = file_path[8:]  # Remove 'backend/' prefix
#             abs_path = dirs["backend"] / rel_path
#         else:
#             abs_path = dirs["root"] / file_path
        
#         # Create parent directories if they don't exist
#         abs_path.parent.mkdir(parents=True, exist_ok=True)
        
#         # Write file content
#         with open(abs_path, "w", encoding="utf-8") as f:
#             f.write(content)
        
#         logger.info(f"Created file: {abs_path}")
def save_project_files(project_data, dirs):
    # Save single index.html file
    with open(dirs["root"] / "index.html", "w", encoding="utf-8") as f:
        f.write(project_data.get("index.html", ""))
    logger.info(f"Created file: {dirs['root']}/index.html")

# Create a zip archive of the project
def create_project_zip(folder_name):
    project_path = Path(f"./generated_projects/{folder_name}")
    zip_path = Path(f"./generated_projects/{folder_name}.zip")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(project_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, project_path.parent))
    
    return zip_path

# Process the experiment generation in background
async def process_experiment(experiment_data):
    try:
        logger.info(f"Starting experiment generation: {experiment_data.experiment_name}")
        
        # Initialize Gemini model
        model = initialize_gemini()
        
        # Step 1: Generate instructions
        logger.info("Generating instructions...")
        instruction_prompt = get_instruction_prompt(experiment_data)
        instruction_response = model.generate_content(instruction_prompt)
        instructions = instruction_response.text
        
        # Step 2: Generate implementation based on instructions
        logger.info("Generating implementation...")
        implementation_prompt = get_implementation_prompt(experiment_data, instructions)
        implementation_response = model.generate_content(implementation_prompt)
        implementation = implementation_response.text
        print(implementation)
        
        # Step 3: Parse the implementation to extract files
        logger.info("Parsing implementation...")
        project_data = parse_implementation(implementation)
        
        # Step 4: Validate the generated project
        logger.info("Validating project...")
        validation_prompt = get_validation_prompt(project_data)
        validation_response = model.generate_content(validation_prompt)
        validation_result = validation_response.text
        
        # Step 5: Check if validation passed or if fixes are needed
        if "ready for use" not in validation_result.lower():
            logger.info("Validation failed, generating fixes...")
            # Generate fixes based on validation feedback
            fixes_prompt = f"""
            Based on this validation feedback:
            
            {validation_result}
            
            Fix all the issues in the project and provide the complete corrected files for the entire project.
            Return the complete code for each file, not just the fixes.
            """
            fixes_response = model.generate_content(fixes_prompt)
            fixed_implementation = fixes_response.text
            project_data = parse_implementation(fixed_implementation)
        # Add this line to process_experiment function after getting the implementation response
        # Step 6: Create project structure and save files
        logger.info("Creating project structure...")
        dirs, folder_name = create_project_structure(experiment_data.experiment_name)
        save_project_files(project_data, dirs)
        
        # Step 7: Create zip archive
        logger.info("Creating zip archive...")
        zip_path = create_project_zip(folder_name)
        
        # Update status in database or storage as completed
        logger.info(f"Experiment generation completed: {experiment_data.experiment_name}")
        return {
            "status": "completed",
            "experiment_name": experiment_data.experiment_name,
            "folder_name": folder_name,
            "zip_path": str(zip_path)
        }
        
    except Exception as e:
        logger.error(f"Error processing experiment: {str(e)}")
        return {"status": "failed", "error": str(e)}

# Parse implementation to extract file content
# def parse_implementation(implementation):
#     project_data = {}
#     current_file = None
#     file_content = []
    
#     # Log the raw implementation for debugging
#     logging.info(f"Raw implementation length: {len(implementation)}")
#     logging.info(f"Implementation preview: {implementation[:200]}...")
    
#     # Split implementation by lines
#     lines = implementation.split('\n')
    
#     for i, line in enumerate(lines):
#         # Check for code block start with filename
#         if line.strip().startswith('```') and '/' in line:
#             # Log when we find a potential file marker
#             logging.info(f"Found potential file marker: {line}")
            
#             if current_file:
#                 # Save previous file
#                 project_data[current_file] = '\n'.join(file_content)
#                 logging.info(f"Saved file: {current_file} with {len(file_content)} lines")
#                 file_content = []
            
#             # Get new filename - be more flexible with format detection
#             parts = line.split('```', 1)
#             if len(parts) > 1:
#                 file_path = parts[1].strip()
#                 # Remove language identifier if present
#                 if ' ' in file_path:
#                     lang, file_path = file_path.split(' ', 1)
#                 current_file = file_path.strip()
#                 logging.info(f"Started new file: {current_file}")
        
#         # Check for code block end
#         elif line.strip() == '```' and current_file:
#             # Save current file
#             project_data[current_file] = '\n'.join(file_content)
#             logging.info(f"Saved file: {current_file} with {len(file_content)} lines")
#             file_content = []
#             current_file = None
        
#         # Add line to current file content if inside a code block
#         elif current_file is not None:
#             file_content.append(line)
    
#     # Save any remaining file content
#     if current_file and file_content:
#         project_data[current_file] = '\n'.join(file_content)
#         logging.info(f"Saved final file: {current_file} with {len(file_content)} lines")
    
#     # Log summary
#     logging.info(f"Total files extracted: {len(project_data)}")
#     if len(project_data) == 0:
#         logging.warning("No files were extracted from the implementation!")
#         # If no files were found with the standard parser, try a fallback method
#         if "```" in implementation and "frontend/index.html" in implementation:
#             logging.info("Attempting fallback parsing method...")
#             # Basic fallback to at least get index.html
#             parts = implementation.split("```")
#             for i in range(len(parts)-1):
#                 if "frontend/index.html" in parts[i]:
#                     project_data["frontend/index.html"] = parts[i+1]
#                     logging.info("Extracted index.html using fallback method")
#                     break
    
#     # Add this after the process_experiment function attempts to parse_implementation
#     if not project_data or len(project_data) == 0:
#         logging.warning("No files were parsed, creating basic fallback files")
#         project_data = {
#             "frontend/index.html": """
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <title>Chemistry Simulation</title>
#                 <style>
#                     body { font-family: Arial, sans-serif; margin: 20px; }
#                     .error { color: red; }
#                 </style>
#             </head>
#             <body>
#                 <h1>Chemistry Simulation: ${experiment_data.experiment_name}</h1>
#                 <p>${experiment_data.experiment_description}</p>
#                 <div class="error">
#                     <h2>Content Generation Issue</h2>
#                     <p>There was an issue generating the simulation content. Please try again.</p>
#                 </div>
#             </body>
#             </html>
#             """
#         }

#     return project_data

def parse_implementation(implementation):
    # Get raw content without any backticks and language identifiers
    content = implementation.strip()
    
    # Remove starting ```html or ``` if present
    if content.startswith("```html"):
        content = content[7:]  # Remove ```html
    elif content.startswith("```"):
        content = content[3:]  # Remove ```
        
    # Remove ending ``` if present
    if content.endswith("```"):
        content = content[:-3]
        
    content = content.strip()  # Remove any extra whitespace
    
    # Create project data with cleaned content
    project_data = {"index.html": content}
    return project_data

@app.post("/api/experiments")
async def create_experiment(
    experiment_data: ExperimentRequest,
    background_tasks: BackgroundTasks
):
    try:
        # Validate the experiment request
        if not experiment_data.experiment_name or not experiment_data.experiment_description:
            raise HTTPException(status_code=400, detail="Experiment name and description are required")
        
        # Start background processing
        background_tasks.add_task(process_experiment, experiment_data)
        
        return JSONResponse(
            status_code=202,
            content={
                "message": "Experiment generation started",
                "experiment_name": experiment_data.experiment_name,
                "status": "processing"
            }
        )
    except Exception as e:
        logger.error(f"Error creating experiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Update the get_experiment_status function
@app.get("/api/experiments/{folder_name}")
async def get_experiment_status(folder_name: str):
    # Check if the experiment exists and index.html is present
    project_path = Path(f"./generated_projects/{folder_name}")
    index_path = project_path / "index.html"
    
    if index_path.exists():
        return {
            "status": "completed",
            "folder_name": folder_name
        }
    elif project_path.exists():
        return {
            "status": "processing",
            "folder_name": folder_name
        }
    else:
        raise HTTPException(status_code=404, detail=f"Experiment {folder_name} not found")

@app.get("/api/download/{folder_name}")
async def download_experiment(folder_name: str):
    zip_path = Path(f"./generated_projects/{folder_name}.zip")
    
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail=f"Experiment {folder_name} zip not found")
    
    # In a real implementation, you would return a FileResponse
    # For this example, just return the path
    return {"download_path": str(zip_path)}

# Main entry point for running the application
if __name__ == "__main__":
    import uvicorn
    
    # Create the generated_projects directory if it doesn't exist
    Path("./generated_projects").mkdir(exist_ok=True)
    
    # Start the FastAPI server
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)