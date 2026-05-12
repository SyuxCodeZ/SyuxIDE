package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	setupRoutes(r)

	fmt.Println("╔══════════════════════════════════╗")
	fmt.Println("║     SYUX IDE Backend Server      ║")
	fmt.Println("║     Listening on :9090           ║")
	fmt.Println("╚══════════════════════════════════╝")

	log.Fatal(r.Run(":9090"))
}
