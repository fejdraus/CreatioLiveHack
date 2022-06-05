define("TsiBaseDetailWithMultiLookupGrid", ["ConfigurationGrid", "css!TsiBaseDetailWithMultiLookupGrid"], function() {

	/**
	 * Контрол грида для детали "Мої менеджери"
	 * Замінює колонку "Зв'язатись" на кнопку
	 * @class Terrasoft.controls.TsiPortalManagerDetailGrid
	 */
	Ext.define("Terrasoft.controls.TsiBaseDetailWithMultiLookupGrid", {
		extend: "Terrasoft.Grid",
		alternateClassName: "Terrasoft.TsiBaseDetailWithMultiLookupGrid",

		/**
		 * @inheritdoc Terrasoft.Grid#init
		 */
		init: function() {
			this.callParent(arguments);
		},

		/**
		 * @inheritdoc Terrasoft.Grid#formatCellContent
		 */
		generateHtmlTpl: function(wrapElClasses) {
			(wrapElClasses || []).push("tsi-BaseMultilookupDetail-Grid");
			return this.callParent(arguments);
		},

		/**
		 * @inheritdoc Terrasoft.Grid#formatCellContent
		 */
		formatCellContent: function(dom, record, column, onclick) {
			var columnName = column.name.bindTo;
			if (this.model.isMultiLookupColumn(columnName)) {
				var newColumn = Terrasoft.deepClone(column);
				var lookupColumn = this.model.getCurrentMultiColumnName.call(this.model, columnName, record);
				if (lookupColumn) {
					newColumn.name.bindTo = lookupColumn;
					onclick = "on" + lookupColumn + "LinkClick";
				}				
				column = newColumn;
			}
			var result = this.callParent([dom, record, column, onclick]);
			return result;
		},

		/**
		 * @inheritdoc Terrasoft.Grid#getRow
		 */
		getRow: function(item) {
			var row = this.callParent(arguments);
			this.setAdditionalMultiLookupColumns(item, row);
			return row;
		},

		/**
		 * Добавить дополнительные поля в запись таблицы для коректного отображения
		 * @param {Object} item запись полученая из БД
		 * @param {Object} row запись таблицы
		 */
		setAdditionalMultiLookupColumns: function(item, row) {
			row.keyImgExtension = row.keyImgExtension || {};
			var columns = this.model.getAdditionalMultiLookupColumns.call(this.model);
			columns.forEach(function(columnName) {
				if (!Ext.isEmpty(row[columnName])) {
					return;
				}
				var dataValueType = item.columns[columnName].dataValueType;
				var clickMethodName = "on" + columnName + "LinkClick";
				row[columnName] = Terrasoft.getTypedStringValue(item.get(columnName), dataValueType);
				row[clickMethodName] = item[clickMethodName]();
				var showImage = this.model.showImage.call(this.model);
				if (showImage) {
					row.keyImgExtension[columnName] = this.getImgConfig(item, columnName);
				}
			}, this);
		},

		/**
		 * Получить конфиг изображения для колонки
		 * @param {Object} item запись обьекта
		 * @param {string} columnName название колонки
		 */
		getImgConfig: function(item, columnName) {
			var referenceSchemaName = item.columns[columnName].referenceSchemaName;
			var imageId = (Terrasoft.configuration.ModuleStructure[referenceSchemaName] || {}).imageId;
			var imageConfig = {
				source: Terrasoft.ImageSources.SYS_IMAGE,
				params: {
					primaryColumnValue: imageId
				}
			};
			return Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
		},

		/**
		 * @inheritdoc Terrasoft.Grid#getDataKey
		 */
		getDataKey: function(name) {
			name = this.callParent(arguments);
			if (Ext.isObject(name) && name.bindTo) {
				var columns = this.model.getAdditionalMultiLookupColumns.call(this.model);
				if (columns.includes(name.bindTo)) {
					name = name.bindTo;
				}
			}
			return name;
		}

	});

});

