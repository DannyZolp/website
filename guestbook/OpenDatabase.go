package guestbook

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func OpenDatabase() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("guestbook.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&Entry{})

	return db
}
