package main

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const (
	workspaceDir = "./workspace/temp"
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
		return runCpp(req.Code, req.Input)
	case "go":
		return runGo(req.Code, req.Input)
	}

	return RunResponse{Success: false, Error: "Unknown error"}
}

func runCpp(code, input string) RunResponse {
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

	var stdout, stderr bytes.Buffer
	runCmd.Stdout = &stdout
	runCmd.Stderr = &stderr
	if strings.TrimSpace(input) != "" {
		runCmd.Stdin = strings.NewReader(input)
	}

	err = runCmd.Run()
	if err != nil {
		if runCtx.Err() == context.DeadlineExceeded {
			msg := "Execution timed out (possible infinite loop)"
			if strings.TrimSpace(input) == "" {
				msg += ". Your program may be waiting for input (stdin). Type input in the input box below the terminal."
			}
			return RunResponse{
				Success: false,
				Output:  stdout.String(),
				Error:   msg,
			}
		}
		return RunResponse{
			Success: false,
			Output:  stdout.String(),
			Error:   stderr.String(),
		}
	}

	return RunResponse{Success: true, Output: stdout.String()}
}

func runGo(code, input string) RunResponse {
	sourcePath := filepath.Join(workspaceDir, "main.go")

	if err := os.WriteFile(sourcePath, []byte(code), 0644); err != nil {
		return RunResponse{Success: false, Error: "Failed to write source: " + err.Error()}
	}

	ctx, cancel := context.WithTimeout(context.Background(), goTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", sourcePath)
	cmd.Dir = workspaceDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if strings.TrimSpace(input) != "" {
		cmd.Stdin = strings.NewReader(input)
	}

	err := cmd.Run()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			msg := "Execution timed out (possible infinite loop)"
			if strings.TrimSpace(input) == "" {
				msg += ". Your program may be waiting for input (stdin). Type input in the input box below the terminal."
			}
			return RunResponse{
				Success: false,
				Output:  stdout.String(),
				Error:   msg,
			}
		}
		return RunResponse{
			Success: false,
			Output:  stdout.String(),
			Error:   stderr.String(),
		}
	}

	return RunResponse{Success: true, Output: stdout.String()}
}
