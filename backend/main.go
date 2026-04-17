package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"github.com/rs/cors"
)

type Applicant struct {
	Name   string  `json:"name"`
	Score  float64 `json:"score"`
	Gender string  `json:"gender"`
}

type Response struct {
	Name              string  `json:"name"`
	OriginalScore     float64 `json:"original_score"`
	FinalScore        float64 `json:"final_score"`
	Status            string  `json:"status"`
	MitigationApplied bool    `json:"mitigation_applied"`
}

func auditHandler(w http.ResponseWriter, r *http.Request) {
	mitigate := r.URL.Query().Get("mitigate") == "true"
	var app Applicant
	json.NewDecoder(r.Body).Decode(&app)

	finalScore := app.Score
	mitigated := false

	// Fairness Logic: If Mitigation is ON, Female applicants between 0.6 and 0.7 get a nudge
	if mitigate && app.Gender == "Female" && app.Score >= 0.6 && app.Score < 0.7 {
		finalScore = 0.72
		mitigated = true
	}

	status := "Rejected"
	if finalScore >= 0.7 {
		status = "Approved"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Name: app.Name, OriginalScore: app.Score,
		FinalScore: finalScore, Status: status,
		MitigationApplied: mitigated,
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/audit", auditHandler)
	handler := cors.Default().Handler(mux)
	fmt.Println("🚀 Go Backend running on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", handler))
}