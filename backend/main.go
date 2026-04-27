package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type Applicant struct {
	Name   string  `json:"name"`
	Score  float64 `json:"score"`
	Gender string  `json:"gender"`
}

type AuditResponse struct {
	Name              string  `json:"name"`
	OriginalScore     float64 `json:"original_score"`
	FinalScore        float64 `json:"final_score"`
	Status            string  `json:"status"`
	MitigationApplied bool    `json:"mitigation_applied"`
}

func auditHandler(w http.ResponseWriter, r *http.Request) {
	// ALLOW CROSS-ORIGIN REQUESTS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	mitigate := r.URL.Query().Get("mitigate") == "true"
	var app Applicant
	json.NewDecoder(r.Body).Decode(&app)

	finalScore := app.Score
	applied := false
	if mitigate && app.Gender == "Female" && app.Score >= 0.6 && app.Score < 0.7 {
		finalScore = 0.72
		applied = true
	}

	status := "Rejected"
	if finalScore >= 0.7 {
		status = "Approved"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuditResponse{
		Name: app.Name, OriginalScore: app.Score, FinalScore: finalScore,
		Status: status, MitigationApplied: applied,
	})
}

func main() {
	http.HandleFunc("/audit", auditHandler)
	// Render sets the PORT environment variable automatically
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	fmt.Printf("🚀 Server online on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
