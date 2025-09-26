package guestbook

import "gorm.io/gorm"

type CreateEntry struct {
	Name    string `json:"name"`
	Message string `json:"message"`
}

type EntryResponse struct {
	Name    string `json:"name"`
	Date    string `json:"date"`
	Message string `json:"message"`
}

type Entry struct {
	gorm.Model
	Name    string
	Date    string
	Message string
	IP      string
}
