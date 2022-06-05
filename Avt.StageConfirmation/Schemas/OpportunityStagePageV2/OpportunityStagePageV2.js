 define("OpportunityStagePageV2", [],
	function() {
		return {
			entitySchemaName: "OpportunityStage",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			attributes: {},
			methods: {},
			rules: {},
			userCode: {},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "AvtConfirmationMessage",
					"values": {
						"bindTo": "AvtConfirmationMessage",
						"layout": {"column": 12, "row": 4, "colSpan": 12}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
