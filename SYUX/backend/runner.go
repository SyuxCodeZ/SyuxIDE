package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const (
	workspaceDir = "../workspace/temp"
	cppTimeout   = 10 * time.Second
	goTimeout    = 15 * time.Second
)

func RunCode(req RunRequest) RunResponse {
	if req.Language != "cpp" && req.Language != "go" {
		return RunResponse{
			Success: false,
			Error:   fmt.Sprintf("Unsupported language: %s", req.Language),
		}
	}

	if err := os.MkdirAll(workspaceDir, 0755); err != nil {
		return RunResponse{
			Success: false,
			Error:   "Failed to create workspace: " + err.Error(),
		}
	}

	switch req.Language {
	case "cpp":
		return runCpp(req.Code)
	case "go":
		return runGo(req.Code)
	}

	return RunResponse{Success: false, Error: "Unknown error"}
}

func runCpp(code string) RunResponse {
	sourcePath := filepath.Join(workspaceDir, "main.cpp")
	outputPath := filepath.Join(workspaceDir, "main.exe")

	if err := os.WriteFile(sourcePath, []byte(code), 0644); err != nil {
		return RunResponse{Success: false, Error: "Failed to write source: " + err.Error()}
	}

	compileCtx, cancel := context.WithTimeout(context.Background(), cppTimeout)
	defer cancel()

	compileCmd := exec.CommandContext(compileCtx, "g++", "-o", outputPath, sourcePath)
	compileOut, err := compileCmd.CombinedOutput()
	if err != nil {
		if compileCtx.Err() == context.DeadlineExceeded {
			return RunResponse{Success: false, Error: "Compilation timed out"}
		}
		return RunResponse{
			Success: false,
			Error:   "Compilation failed:\n" + string(compileOut),
		}
	}

	runCtx, cancel := context.WithTimeout(context.Background(), cppTimeout)
	defer cancel()

	runCmd := exec.CommandContext(runCtx, outputPath)
	runCmd.Dir = workspaceDir
	stdout, err := runCmd.Output()
	if err != nil {
		if runCtx.Err() == context.DeadlineExceeded {
			return RunResponse{Success: false, Error: "Execution timed out (possible infinite loop)"}
		}
		if exitErr, ok := err.(*exec.ExitError); ok {
			return RunResponse{
				Success: false,
				Output:  string(stdout),
				Error:   string(exitErr.Stderr),
			}
		}
		return RunResponse{Success: false, Error: err.Error()}
	}

	return RunResponse{Success: true, Output: string(stdout)}
}

func runGo(code string) RunResponse {
	sourcePath := filepath.Join(workspaceDir, "main.go")

	if err := os.WriteFile(sourcePath, []byte(code), 0644); err != nil {
		return RunResponse{Success: false, Error: "Failed to write source: " + err.Error()}
	}

	ctx, cancel := context.WithTimeout(context.Background(), goTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", sourcePath)
	cmd.Dir = workspaceDir
	output, err := cmd.CombinedOutput()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return RunResponse{Success: false, Error: "Execution timed out (possible infinite loop)"}
		}
		return RunResponse{Success: false, Error: string(output)}
	}

	return RunResponse{Success: true, Output: string(output)}
}
