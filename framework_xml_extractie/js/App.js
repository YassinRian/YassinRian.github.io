define(["jquery",
    "https://yassinrian.netlify.app/framework_xml_extractie/js/UI.js",
    "https://yassinrian.netlify.app/framework_xml_extractie/js/Extractor.js",
    "https://yassinrian.netlify.app/framework_xml_extractie/js/Styles.js"
], function($, UI, Extractor, Styles) {
    "use strict";

    class App {
        constructor() {
            this.extractor = new Extractor();
            this.ui = null;
            this.allData = []; // Central storage for search/filter
            Styles.inject();
        }

        draw(oControlHost) {
            this.ui = new UI(oControlHost.container);
            this.ui.renderSkeleton();
            $(oControlHost.container).on("change", "#xml-upload", (e) => this.handleUpload(e));
        }

        async handleUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            this.ui.updateStatus("Bezig met verwerken...");

            try {
                await this.extractor.parseFile(file);

                // Collect all layers
                const dataLayer = this.extractor.getLayerData('Datalaag');
                const modelLayer = this.extractor.getLayerData('Modellaag');
                
                // Store for later use in search
                this.allData = [...dataLayer, ...modelLayer];

                this.ui.displayModel(this.allData);
                this.ui.updateStatus(`Succes: ${this.allData.length} objecten geladen.`);

            } catch (err) {
                this.ui.updateStatus("Fout: " + err.message);
                console.error(err);
            }
        }
    }

    return App;
});
