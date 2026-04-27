import React, { useState, useEffect, useRef, useMemo } from 'https://esm.sh/react@18.2.0';
import * as echarts from 'https://esm.sh/echarts@5.4.3';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(React.createElement);

export function initApp({ engine, data, Mui }) {
    if (!Mui) return html`<div style=${{padding: '20px'}}>Initialiseren...</div>`;

    const { Container, AppBar, Toolbar, Typography, TextField, Card, Box, DataGrid, Grid, Chip, Button } = Mui;

    const [status, setStatus] = useState("Wachten op data...");
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState("");
    const [zoomIndices, setZoomIndices] = useState({ start: 0, end: 100 }); // Track zoom range
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // --- ENGINE LOGIC ---
    useEffect(() => {
        if (!data) return;
        async function runEngine() {
            try {
                setStatus("Engine starten...");
                await engine.init();
                await engine.insertData("cashflow", data.columnNames, data.rows);
                const sql = `SELECT CAST("Jaar" AS VARCHAR) as id, CAST("Jaar" AS VARCHAR) as jaar, ROUND(SUM(CAST("Restbudget (okr)" AS DOUBLE)), 2) as budget, ROUND(SUM(CAST("Lopend totaal" AS DOUBLE)), 2) as totaal FROM cashflow GROUP BY "Jaar" ORDER BY "Jaar" ASC`;
                const res = await engine.query(sql);
                setResults(res);
                setStatus("Gereed");
            } catch (e) { setStatus("Fout: " + e.message); }
        }
        runEngine();
    }, [data]);

    // --- SYNCED DATA CALCULATION ---
    // This is the "Master List" filtered by both the text input AND the zoom slider
    const finalDisplayData = useMemo(() => {
        // 1. First apply the text filter
        let filtered = results.filter(d => d.jaar.toLowerCase().includes(filter.toLowerCase()));
        
        // 2. Then crop based on chart zoom percentage
        const startIdx = Math.floor((zoomIndices.start / 100) * filtered.length);
        const endIdx = Math.ceil((zoomIndices.end / 100) * filtered.length);
        
        return filtered.slice(startIdx, endIdx);
    }, [results, filter, zoomIndices]);

    // --- CHART & EVENT HANDLERS ---
    useEffect(() => {
        if (chartRef.current && !chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);

            // SYNC CLICK: Set text filter
            chartInstance.current.on('click', (params) => {
                if (params.componentType === 'series') setFilter(params.name);
            });

            // SYNC ZOOM: Update the zoomIndices state
            chartInstance.current.on('datazoom', (params) => {
                // ECharts gives us start/end as 0-100 percentage
                let start, end;
                if (params.batch) {
                    start = params.batch[0].start;
                    end = params.batch[0].end;
                } else {
                    start = params.start;
                    end = params.end;
                }
                setZoomIndices({ start, end });
            });
        }

        if (chartInstance.current) {
            // We only update the chart with results + text filter. 
            // The chart handles its OWN zoom internally, so we don't pass sliced data back to it.
            const chartData = results.filter(d => d.jaar.toLowerCase().includes(filter.toLowerCase()));
            
            chartInstance.current.setOption({
                tooltip: { trigger: 'axis' },
                legend: { bottom: 0 },
                dataZoom: [{ type: 'slider', height: 20, bottom: 40 }, { type: 'inside' }],
                grid: { top: 60, bottom: 100, left: 80, right: 80 },
                xAxis: { type: 'category', data: chartData.map(d => d.jaar) },
                yAxis: [{ type: 'value', name: 'Budget' }, { type: 'value', position: 'right' }],
                series: [
                    { name: 'Budget', type: 'bar', data: chartData.map(d => d.budget), itemStyle: { color: '#004699' } },
                    { name: 'Lopend Totaal', type: 'line', yAxisIndex: 1, data: chartData.map(d => d.totaal), lineStyle: { color: '#ffcc00' } }
                ]
            }, true);
        }
    }, [results, filter]); // We do NOT put zoomIndices here to prevent infinite loops

    const columns = [
        { field: 'jaar', headerName: 'Jaar', flex: 0.6 },
        { field: 'budget', headerName: 'Budget', flex: 1, renderCell: (params) => html`<${Chip} label=${`€ ${params.value.toLocaleString('nl-NL')}`} size="small" color=${params.value >= 0 ? 'primary' : 'error'} />` }
    ];

    return html`
        <${Box} sx=${{ flexGrow: 1, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <${AppBar} position="static" elevation=${0} sx=${{ bgcolor: '#004699' }}>
                <${Toolbar}><${Typography} variant="h6">Rotterdam Sync Analytics<//><//>
            <//>
            <${Container} maxWidth="xl" sx=${{ mt: 3 }}>
                <${Grid} container spacing=${2}>
                    <${Grid} item xs=${12} md=${8}>
                        <${Card} sx=${{ height: '650px', p: 2 }}>
                            <${Box} sx=${{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <${Typography} variant="h6">Cashflow Visualisatie<//>
                                <${Box}>
                                    <${TextField} size="small" placeholder="Zoek..." value=${filter} onInput=${(e) => setFilter(e.target.value)} sx=${{mr: 1}} />
                                    <${Button} variant="outlined" size="small" onClick=${() => { setFilter(""); chartInstance.current.dispatchAction({ type: 'dataZoom', start: 0, end: 100 }); }}>Reset<//>
                                <//>
                            <//>
                            <div ref=${chartRef} style=${{ width: '100%', height: '530px' }}></div>
                        <//>
                    <//>
                    <${Grid} item xs=${12} md=${4}>
                        <${Card} sx=${{ height: '650px' }}>
                            <${DataGrid} 
                                rows=${finalDisplayData} 
                                columns=${columns} 
                                pageSize=${15} 
                                density="compact"
                                sx=${{ border: 'none' }}
                            />
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `;
}