package helpers

import (
	"time"
)

func GetDate() string {
	t := time.Now()

	return t.Format(time.RFC1123)

}
