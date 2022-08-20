const dataset  = new wire.data.DataSet({
    
    Source: new wire.data.DataSource("local", {
        Provider: {
            Json: { url: "../../data/sample-data.json" }
        }
    }),

    Query: wire.data.select("Product", "Promotion").top(5).distinct()
   
});

export default dataset;