package main

type RunRequest struct {
	Language string `json:"language"`
	Code     string `json:"code"`
}

type RunResponse struct {
	Output  string `json:"output"`
	Error   string `json:"error"`
	Success bool   `json:"success"`
}
