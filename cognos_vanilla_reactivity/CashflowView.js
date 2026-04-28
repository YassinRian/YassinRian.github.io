define([], function() {
    "use strict";
    return {
        template: `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
            <style>
                :root { --primary: #004699; --spacing: 1rem; }
                .rtm-container { padding: var(--spacing); background: #f4f7f9; border-radius: 8px; }
                .rtm-header-card { background: var(--primary); color: white; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; }
                
                /* Layout: Chart takes 2 parts, Grid takes 1 part */
                .rtm-layout { 
                    display: grid; 
                    grid-template-columns: 2fr 1fr; 
                    gap: var(--spacing); 
                    align-items: start;
                }

                .card-surface { 
                    background: white; 
                    padding: 1rem; 
                    border-radius: 6px; 
                    border: 1px solid #d1d9e0; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                #rtm-chart { width: 100%; height: 500px; }
                
                /* Ensure grid matches chart height and scrolls */
                #rtm-grid-container { height: 500px; overflow-y: auto; }

                @media (max-width: 1000px) {
                    .rtm-layout { grid-template-columns: 1fr; }
                }
            </style>
            <div class="rtm-container">
                <header class="rtm-header-card">
                    <h5 style="margin:0">Cashflow Analyse Rotterdam</h5>
                </header>
                
                <div id="rtm-status" style="font-size: 12px; margin-bottom: 10px; color: #555;">Gereed</div>

                <div class="rtm-layout">
                    <div class="card-surface">
                        <div id="rtm-chart"></div>
                    </div>

                    <div class="card-surface" id="rtm-grid-container">
                        <div id="rtm-grid"></div>
                    </div>
                </div>
            </div>
        `
    };
});