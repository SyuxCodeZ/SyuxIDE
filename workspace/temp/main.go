package main;

import ("fmt"; "bufio"; "os"); func main() { scanner := bufio.NewScanner(os.Stdin); scanner.Scan(); name := scanner.Text(); fmt.Printf("Hello, %s!", name) }