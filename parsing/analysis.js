define([], function () {
    function analyzeColumnData(data, columnIndex, type) {
      const values = new Map();
      let total = 0;
  
      data.forEach((item) => {
        const value = item.name.trim(); // Example
        values.set(value, (values.get(value) || 0) + 1);
        total++;
      });
  
      const sortedData = Array.from(values.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          value: value || "(empty)",
          count,
          percentage: ((count / total) * 100).toFixed(1),
        }));
  
      return {
        total,
        uniqueCount: values.size,
        frequencies: sortedData,
      };
    }
  
    return {
      analyzeColumnData,
    };
  });
  