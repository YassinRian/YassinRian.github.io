define(function(){
    return {
        verwerken: (xml_) => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(xml_, "text/xml");
            const results = document.getElementsByClassName('results');
            let newtxt = '<table  class="docTable">';
            newtxt += this.shownode(doc.childNodes[0]);

            if (results)

            {           newtxt += '</table>';

                        results[0].innerHTML = newtxt.replace(/\n/g, '<br>');                  // vervang alle enters in de tekst door <br>

            }

            console.log(newtxt);

        },

        shownode: (node) =>{

         const nodeNames = ['expression','query', 'dataItem', 'detailFilter', 'v2_combinationChart', 'chartNodeMember', 'v2_marker',

                                                                       'propertyItem', 'reportDrill', 'parameterContext', 'dataItemContext', 'drillLink', 'singleton', 'dataItemValue',

                                                                       'v2_defaultChartMeasure', 'modelPath', 'reportName'];

           

            // nog: sortItem (met attribuut refDataItem),

            let outp = '';

            if (nodeNames.includes(node.nodeName))                                                                                                          // mijn filter

            {           if (node.nodeName === 'query')

                        {           outp += '<tr><td>***************</td><td> </td></tr>';

                                   outp += '<tr><td>*** Query ***</td>';

                                   outp += '<td>' + node.getAttribute('name') + '</td></tr>'; //query

                                   outp += '<tr><td>***************</td><td> </td></tr>';

                        }

 

                        if (node.getAttribute('name'))

                        {           if (node.nodeName === 'dataItem')

                                   {           outp += '<tr><td>' + node.getAttribute('name') + '</td><td>' + node.textContent + '</td></tr>';

                                   }

                        }

 

                        if (node.nodeName === 'reportName')

                        {           outp += '<tr><td>************************</td><td></td></tr>' +

                                                           '<tr><td>*** Reportname ***</td><td>' + node.textContent + '</td></tr>' +

                                                     '<tr><td>************************</td><td></td></tr>';

                        }

 

 

                        if (node.nodeName === 'detailFilter')

                        {           outp += '<tr><td>Filter (' + (node.getAttribute('use') || 'required') + '):</td><td>' + node.textContent +'</td></tr>';

                        }

                       

                        if (node.nodeName === 'v2_combinationChart')

                        {           outp += '<tr><td>**************</td><td></td></tr>' +

                                                           '<tr><td>*** chart ***</td><td>' + node.getAttribute('name') + '</td></tr>' +

                                                           '<tr><td>**************</td><td><div class="tab">' + node.getAttribute('refQuery') + ' (query)</div></td></tr>';

                        }

 

                        if (node.nodeName === 'propertyItem')

                        {           outp += '<tr><td><div class="tab">(property:)</div></td><td>' + node.getAttribute('refDataItem') + '</td></tr>';    //veld in properties lijst

                        }

 

                        if (node.nodeName === 'chartNodeMember' || node.nodeName === 'v2_marker')

                        {           outp += '<tr><td>field:</td><td>' + node.getAttribute('refDataItem') + '</td></tr>';    //item in grafiek

                        }

 

                        if (node.nodeName === 'reportDrill')

                        {           outp += '<tr><td>reportDrill:</td><td>' + node.getAttribute('name') + '</td></tr>';

                        }

                       

                        if (node.nodeName === 'dataItemValue')

                        {           outp += '<tr><td></td><td><div class="tab">' + node.getAttribute('refDataItem') + '</div></td></tr>';

                        }

 

                        if (node.nodeName === 'v2_defaultChartMeasure')

                        {           outp += '<tr><td>Default measure:</td><td>' + node.getAttribute('refDataItem') + '</td></tr>';

                        }

                       

                        if (node.nodeName === 'singleton')

                        {           const name = node.getAttribute('name');

                                   const qry = node.getAttribute('refQuery');

                                   outp += '<tr><td>singleton:</td><td>' + name + ' (query: ' + qry + ')</td></tr>';

                        }

 

                        if (node.nodeName === 'drillLink')

                        {           const tgt = node.childNodes[0].childNodes[0].getAttribute('parameter');

                                   const par = node.childNodes[1].childNodes[0].getAttribute('parameter');

                                   const dat = node.childNodes[1].childNodes[0].getAttribute('refDataItem');

                                   const out = (par) ? par : dat;

                                   outp += '<tr><td></td><td><div class="tab">' + tgt + ' = ' + out + '</div></td></tr>';

                                  

                        }

 

                        if (node.nodeName === 'modelPath')

                        {           outp += '<tr><td>**********************************</td><td></td></tr>' +

                                                           '<tr><td>*** Data module / package ***</td><td>' + node.textContent + '</td></tr>' +

                                               '<tr><td>**********************************</td><td></td></tr>';

                        }

 

 

            }

            for(let i=0; i<node.childNodes.length; i++)

            {           outp += shownode(node.childNodes[i]);

            }

            return outp;

        }


    }
})