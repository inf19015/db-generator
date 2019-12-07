export default {
	"name": "Date",
	"fieldGroup": "human_data",
	"fieldGroupOrder": 40,
	"schema": {
		"title": "Date",
		"$schema": "http://json-schema.org/draft-04/schema#",
		"type": "object",
		"properties": {
			"fromDate": {
				"type": "string"
			},
			"toDate": {
				"type": "string"
			},
			"placeholder": {
				"type": "string"
			}
		},
		"required": [
			"fromDate",
			"toDate",
			"placeholder"
		]
	}
}
