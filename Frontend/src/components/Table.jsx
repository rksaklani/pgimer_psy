const Table = ({ columns, data, loading = false, emptyMessage = 'No data available', mobileCardView = true }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="space-y-3 md:hidden">
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="backdrop-blur-sm bg-white/70 border border-white/40 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="space-y-2.5">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {column.header}:
                    </span>
                    <div className="text-sm text-gray-900 break-words">
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.accessor]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={`overflow-x-auto backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl shadow-lg ${mobileCardView ? 'hidden md:block' : ''}`}>
        <table className="min-w-full divide-y divide-white/30">
          <thead className="backdrop-blur-md bg-white/50 border-b border-white/40">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="backdrop-blur-sm bg-white/40 divide-y divide-white/30">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-white/60 transition-colors duration-200">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-xs sm:text-sm text-gray-900"
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-[200px] md:max-w-none">
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.accessor]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;

