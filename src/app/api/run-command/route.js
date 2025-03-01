import { spawn } from "child_process";
import path from "path";

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = {
  physics: "uvicorn physim:app --reload",
  chemistry: "uvicorn chemsim:app --reload",
  default: "npm start ExperimentStatus",
};

// Function to execute a command and return a promise
function executeCommand(program, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(program, args);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`stdout: ${data}`);
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`stderr: ${data}`);
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject({
          code,
          stdout: output,
          stderr: errorOutput,
        });
      } else {
        resolve({
          stdout: output,
          stderr: errorOutput,
        });
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { simulationDetails } = req.body;
  const subject = simulationDetails?.subject?.toLowerCase() || "default";

  // Get the first command from the whitelist
  const command1 = ALLOWED_COMMANDS[subject] || ALLOWED_COMMANDS.default;
  console.log(
    `Running command 1: ${command1} for simulation: ${simulationDetails?.title}`
  );

  try {
    // Split both commands into program and args
    const [program1, ...args1] = command1.split(" ");

    // Execute the first command
    const result1 = await executeCommand(program1, args1);
    console.log("Command 1 completed successfully");

    // Execute the second command (experiment status viewer)
    const command2 = "npm start ExperimentStatus";
    const [program2, ...args2] = command2.split(" ");

    console.log(`Running command 2: ${command2}`);
    const result2 = await executeCommand(program2, args2);
    console.log("Command 2 completed successfully");

    // After both commands complete successfully, send the simulation details
    try {
      const apiResponse = await fetch("http://localhost:8000/api/experiments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulationDetails),
      });

      const apiData = await apiResponse.json();

      res.status(200).json({
        message: "Both commands executed successfully",
        command1Result: result1,
        command2Result: result2,
        apiResponse: apiData,
      });
    } catch (fetchError) {
      console.error("Error sending simulation details:", fetchError);
      res.status(200).json({
        message:
          "Commands executed successfully, but failed to send simulation details",
        command1Result: result1,
        command2Result: result2,
        fetchError: fetchError.message,
      });
    }
  } catch (error) {
    console.error("Error executing commands:", error);
    return res.status(500).json({
      error: "Failed to execute commands",
      details: error,
    });
  }
}
