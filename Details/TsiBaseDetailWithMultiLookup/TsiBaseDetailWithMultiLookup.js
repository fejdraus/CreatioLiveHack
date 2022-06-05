/**
 * Деталь позволяет отображать в одной колонке данные из двух
 * @example
 * getMultiLookupColumnConfig: function() {
 *  return {
 *    // Указываем колонки которые необходимо обьеденить, и колонку в которой они будут отображатся
 *    // (удобно добавить колонку для возможности настройки колонок)
 *    "TsiClient": ["Contact", "Account"]
 *  };
 * },
 * // Если необходимо запретить добавление записей:
 * getAddRecordButtonVisible:  Terrasoft.emptyFn,
 * // Если необходимо добавлять записи из справочников то необходимо заместить метод
 * getChildLookupConfig: function() {
 *   var config = this.getMultiLookupPageConfig({}, "TsiClient");
 *   this.setMultiLookupConfigColumnFilters(config, "Contact", this.getNotExistsFilters("Contact"));
 *   return config;
 * },
 */

define("TsiBaseDetailWithMultiLookup", ["TsiBaseDetailWithMultiLookupGrid"], function() {
	return {
		attributes: {},
		mixins: {},
		methods: {
			/**
			 * @inheritdoc BaseGridDetailV2#getCopyRecordMenuItem
			 */

			getAddRecordButtonVisible: function() {
				return !this.get("IsDetailCollapsed");
			},
			getEditRecordMenuItem: Terrasoft.emptyFn,
			getSwitchGridModeMenuItem: Terrasoft.emptyFn,
			getDataImportMenuItem: Terrasoft.emptyFn,
			getLookupValuePairs: Terrasoft.emptyFn,
			/**
			 * @inheritdoc BaseGridDetailV2#addGridDataColumns
			 */
			addGridDataColumns: function(esq) {
				this.callParent(arguments);
				var columns = this.getAdditionalMultiLookupColumns();
				columns.forEach(function(columnName) {
					if (!esq.columns.contains(columnName)) {
						esq.addColumn(columnName);
					}
				}, this);
			},
			/**
			 * Получить конфигурацию колонок
			 * @returns {Object}
			 */
			getMultiLookupColumnConfig: function() {
				return {};
			},
			/**
			 * Получить перечень дополнительных колонок (для коректного отображения)
			 * @returns {Array}
			 */
			getAdditionalMultiLookupColumns: function() {
				var multiLookupColumns = this.getMultiLookupColumnConfig();
				var columns = [];
				for (var columnName in multiLookupColumns) {
					columns = columns.concat(multiLookupColumns[columnName]);
				}
				return columns;
			},
			/**
			 * Проверить является ли колонка мультисправочной
			 * @param {string} columnName название колонки
			 * @returns {boolean}
			 */
			isMultiLookupColumn: function(columnName) {
				return this.getMultiLookupColumnConfig().hasOwnProperty(columnName);
			},
			/**
			 * Получить название колонки которую необходимо отображать
			 * @param {string} columnName название колонки
			 * @param {Object} record запись
			 * @returns {string}
			 */
			getCurrentMultiColumnName: function(columnName, record) {
				var columns = this.getMultiLookupColumnConfig()[columnName];
				return columns.find(column => !Ext.isEmpty(record[column]));
			},
			/**
			 * Получить перечень колонок которые отображаются на месте
			 * @param {string} columnName название колонки
			 * @returns {Array}
			 */
			getMultiLookupColumns: function(columnName) {
				return this.getMultiLookupColumnConfig()[columnName];
			},
			/**
			 * Установить фильтры для колонки при открытии справочника добавления нового значения
			 * @param {Object} config конфиг открытия одального окна
			 * @param {string} columnName название колонки
			 * @param {Object} filters фильтры
			 */
			setMultiLookupConfigColumnFilters: function(config, columnName, filters) {
				var column = config.multiLookupConfig.find(item => item.multiLookupColumnName === columnName) || {};
				column.filters = filters;
			},
			/**
			 * Необходимо ли отображать иконку у записи
			 */
			showImage: function() {
				return true;
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"className": "Terrasoft.TsiBaseDetailWithMultiLookupGrid"
				}
			}
		]/**SCHEMA_DIFF*/
	};
});