define(function () {
  return {
    getQueries: function (xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const queries = xmlDoc.querySelectorAll("query");

      return Array.from(queries).map((query) => ({
        type: "Query",
        name: query.getAttribute("name"),
        attributes: {},
        items: Array.from(query.querySelectorAll("dataItem")).map(
          (dataItem) => ({
            name: dataItem.getAttribute("name"),
            attributes: {
              label: dataItem.getAttribute("label"),
              expression:
                dataItem.querySelector("expression")?.textContent || "",
            },
          })
        ),
      }));
    },

    getLists: function (xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const lists = xmlDoc.querySelectorAll("list");

      return Array.from(lists).map((list) => ({
        type: "List",
        name: list.getAttribute("name"),
        attributes: { refQuery: list.getAttribute("refQuery") },
        items: Array.from(list.querySelectorAll("dataItemLabel")).map(
          (label) => ({
            name: label.getAttribute("refDataItem"),
            attributes: {},
          })
        ),
      }));
    },

    getDetailFilters: function (xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const queries = xmlDoc.querySelectorAll("query");

      return Array.from(queries)
        .filter((query) => query.querySelector("detailFilters"))
        .map((query) => ({
          type: "DetailFilter",
          name: query.getAttribute("name"),
          attributes: {
            filterExpression:
              query.querySelector("filterExpression")?.textContent || "",
          },
          items: [],
        }));
    },

    addLabelsToList: function (queryData, listData) {
      return listData.map((list) => ({
        type: "List",
        name: list.name,
        attributes: { refQuery: list.attributes.refQuery },
        items: list.items.map((refItem) => {
          const query = queryData.find(
            (q) => q.name === list.attributes.refQuery
          );
          const matchingItem = query?.items.find(
            (qItem) => qItem.name === refItem.name
          );
          return {
            name: refItem.name,
            attributes: {
              label: matchingItem?.attributes.label || "",
            },
          };
        }),
      }));
    },
  };
});
