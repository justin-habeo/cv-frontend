# Manual Data Entry Widget

## Overview

The Manual Data Entry Widget is a powerful tool designed for inputting, editing, and managing field data directly within your dashboard. This widget provides a flexible, spreadsheet-like interface for recording various types of agricultural data.

## Features

1. **Tabular Data Entry**: Enter data in a familiar spreadsheet-like grid.
2. **Customizable Columns**: Adapt the widget to your specific data collection needs.
3. **Edit and Delete**: Easily modify or remove existing entries.
4. **Data Validation**: Built-in checks to ensure data integrity.
5. **Sorting and Filtering**: Quickly find and organize your data.
6. **Export Functionality**: Save your data in various formats for external use.

## Configuration

The Manual Data Entry Widget can be configured using a JSON object with the following structure:

```json
{
  "title": "Field Measurements",
  "initialData": [
    {
      "id": 1,
      "date": "2023-07-29",
      "fieldName": "Field A",
      "measurement": "Soil pH",
      "value": "6.5"
    },
    {
      "id": 2,
      "date": "2023-07-29",
      "fieldName": "Field B",
      "measurement": "Nitrogen Level",
      "value": "40 ppm"
    }
  ],
  "columns": [
    { "field": "id", "headerName": "ID", "width": 70 },
    { "field": "date", "headerName": "Date", "width": 130, "editable": true },
    { "field": "fieldName", "headerName": "Field Name", "width": 150, "editable": true },
    { "field": "measurement", "headerName": "Measurement Type", "width": 180, "editable": true },
    { "field": "value", "headerName": "Measured Value", "width": 150, "editable": true }
  ]
}

## How to Use

### Adding New Data

1. Click the "Add New Row" button at the bottom of the widget.
2. Fill in the data for each column in the new row.
3. Press Enter or click outside the row to save the new entry.

### Editing Existing Data

1. Double-click on any cell you wish to edit.
2. Modify the data as needed.
3. Press Enter or click outside the cell to save your changes.

### Deleting Entries

1. Select the row(s) you wish to delete by clicking the checkbox on the left.
2. Click the "Delete Selected" button that appears above the table.
3. Confirm the deletion in the popup dialog.

### Customizing Columns

1. Click the "Customize Columns" button above the table.
2. In the dialog that appears, you can:
   - Add new columns
   - Remove existing columns
   - Reorder columns
   - Set data types for each column

### Sorting and Filtering

1. Click on any column header to sort the data by that column.
2. Use the filter icon next to each column header to apply filters.

### Exporting Data

1. Click the "Export" button above the table.
2. Choose your preferred format (CSV, Excel, JSON).
3. Select the columns you wish to include in the export.
4. Click "Export" to download your data file.

## Best Practices

1. **Regular Saving**: Although the widget auto-saves, it's good practice to manually save important changes.
2. **Data Validation**: Use the built-in validation features to ensure data accuracy.
3. **Consistent Naming**: Use clear, consistent names for your columns to maintain organization.
4. **Backup**: Regularly export your data as a backup.

## Troubleshooting

- **Data Not Saving**: Ensure you have a stable internet connection. Try refreshing the page.
- **Column Customization Not Working**: Clear your browser cache and reload the page.
- **Export Failing**: Check that you have selected at least one column for export.

## Additional Support

For further assistance or to report issues, please contact our support team at support@smartgrow.com or use the in-app help feature.

---

We hope this Manual Data Entry Widget enhances your data management capabilities. Your feedback is valuable to us as we continue to improve our tools.