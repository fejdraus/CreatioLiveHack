/**
 * Редактируемая деталь с реестром
 */
define("TsiBaseEditableDetail", ["ConfigurationGrid", "ConfigurationGridGenerator", "ConfigurationGridUtilities"],
function() {
	return {
		mixins: {
			ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
		},
		attributes: {
			"IsEditable": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"value": true,
				"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
			}
		},
		methods: {},
		rules: {},
		details: /**SCHEMA_DETAILS*/ {} /**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/ [
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"className": "Terrasoft.ConfigurationGrid",
					"generator": "ConfigurationGridGenerator.generatePartial",
					"generateControlsConfig": {"bindTo": "generatActiveRowControlsConfig"},
					"changeRow": {"bindTo": "changeRow"},
					"unSelectRow": {"bindTo": "unSelectRow"},
					"onGridClick": {"bindTo": "onGridClick"},
					"activeRowActions": [
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "save",
							"markerValue": "save",
							"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
						},
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "cancel",
							"markerValue": "cancel",
							"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
						},
						{
							"className": "Terrasoft.Button",
							"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"tag": "remove",
							"markerValue": "remove",
							"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
						}
					],
					"listedZebra": true,
					"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
					"activeRowAction": {"bindTo": "onActiveRowAction"},
					"multiSelect": false
				}
			}
		] /**SCHEMA_DIFF*/
	};
});