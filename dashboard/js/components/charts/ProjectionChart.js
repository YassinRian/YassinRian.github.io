define([], function () {
  "use strict";

  /**
   * Financial Projection Chart - Combined bar + line chart.
   * Matches the 364 Cognos dashboard visualization.
   */
  class ProjectionChart {
    constructor(container, eventBus) {
      this.container = container;
      this.eventBus = eventBus;
      this.chart = null;
      this.element = null;
      this.echarts = null;

      this.init();
    }

    async init() {
      // Load ECharts dynamically if not already available
      if (typeof echarts !== "undefined") {
        this.echarts = echarts;
      } else {
        // Dynamically import ECharts
        try {
          const module = await import(
            "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.esm.min.js"
          );
          this.echarts = module;
        } catch (err) {
          console.error("[ProjectionChart] Failed to load ECharts:", err);
          return;
        }
      }

      this.render();
      this.setupEvents();

      // If data was already queued, render it
      if (this._pendingData) {
        this.update(this._pendingData);
        this._pendingData = null;
      }
    }

    render() {
      this.element = document.createElement("div");
      this.element.style.width = "100%";
      this.element.style.height = "450px";
      this.container.appendChild(this.element);

      this.chart = this.echarts.init(this.element);
    }

    setupEvents() {
      // Click event for cross-filtering
      this.chart.on("click", (params) => {
        if (params.componentType === "series") {
          this.eventBus.emit("chart:selection", {
            dimension: "JAAR",
            values: [params.name],
          });
        }
      });

      // Resize handler
      window.addEventListener("resize", () => this.resize());
    }

    update(data) {
      if (!data || data.length === 0) return;

      // If chart isn't initialized yet, queue the data
      if (!this.chart) {
        this._pendingData = data;
        return;
      }

      // Sort by year
      const sorted = [...data].sort((a, b) => a.JAAR - b.JAAR);

      const years = sorted.map((r) => String(r.JAAR));
      const revenues = sorted.map((r) => r.RESTBUDGET_OBRENGSTEN);
      const costs = sorted.map((r) => r.RESTBUDGET__KST_RES);
      const cumulative = sorted.map((r) => r.CUMULATIEVE_BOEKWAARDE);

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross" },
          formatter: function (params) {
            let html = "<strong>" + params[0].name + "</strong><br/>";
            params.forEach((p) => {
              const value =
                typeof p.value === "number"
                  ? p.value.toLocaleString("nl-NL", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : p.value;
              html +=
                p.marker +
                " " +
                p.seriesName +
                ": <strong>\u20AC " +
                value +
                "</strong><br/>";
            });
            return html;
          },
        },
        legend: {
          data: [
            "Opbrengsten (Opbr)",
            "Kosten + Resultaatneming",
            "Lopend totaal",
          ],
          top: 0,
          right: 10,
          textStyle: { fontSize: 11 },
        },
        grid: {
          left: 80,
          right: 40,
          top: 50,
          bottom: 80,
        },
        xAxis: {
          type: "category",
          data: years,
          axisLabel: { rotate: 45, fontSize: 10 },
          axisLine: { lineStyle: { color: "#333" } },
        },
        yAxis: {
          type: "value",
          name: "\u20AC",
          nameTextStyle: { fontSize: 12 },
          axisLabel: {
            formatter: function (value) {
              return "\u20AC " + value.toLocaleString("nl-NL");
            },
            fontSize: 10,
          },
          splitLine: { lineStyle: { color: "#e8e8e8" } },
          axisLine: { lineStyle: { color: "#333" } },
        },
        series: [
          {
            name: "Opbrengsten (Opbr)",
            type: "bar",
            data: revenues,
            itemStyle: {
              color: "#2d8a4e",
              borderRadius: [2, 2, 0, 0],
            },
            barGap: "0%",
            barCategoryGap: "40%",
          },
          {
            name: "Kosten + Resultaatneming",
            type: "bar",
            data: costs,
            itemStyle: {
              color: "#d94141",
              borderRadius: [0, 0, 2, 2],
            },
          },
          {
            name: "Lopend totaal",
            type: "line",
            data: cumulative,
            lineStyle: { color: "#1890ff", width: 2 },
            itemStyle: { color: "#1890ff" },
            symbol: "none",
          },
        ],
      };

      this.chart.setOption(option, true);
    }

    resize() {
      if (this.chart) {
        this.chart.resize();
      }
    }

    dispose() {
      if (this.chart) {
        this.chart.dispose();
      }
    }
  }

  return ProjectionChart;
});
