Methodology: Estimating the Environmental Footprint of an AI Chat

This document explains the estimation model used in the Streamlit application. It is crucial to understand that these are estimates for awareness and educational purposes, not precise accounting figures.

The true cost is highly variable and depends on many factors not included here. However, this model provides a solid, research-backed foundation to visualize the impact.

We will calculate three key metrics per query:

Energy (in Watt-hours, Wh)

Carbon (in grams of CO2-equivalent, gCO2e)

Water (in Liters, L)

1. Energy Calculation (Wh per Query)

It's nearly impossible to know the exact energy of a single API call. Instead, we use an average, estimated value from academic research as our baseline.

Baseline: Research varies, but studies and estimates (like those from Alex de Vries or Luccioni, et al.) place a single generative AI query in the range of 0.5 to 5.0 Watt-hours (Wh). This is significantly more than a traditional Google search (often cited around 0.3 Wh).

Our Model: We will use a "Model Size" slider to approximate this.

Small (Demo): 0.5 Wh

Medium (e.g., GPT-3.5-level): 1.5 Wh

Large (e.g., GPT-4-level): 4.0 Wh

Formula:
Total Energy = Number of Queries * Energy_Per_Query_Wh

2. Carbon Calculation (gCO2e per Query)

The carbon footprint is not about the energy used; it's about how that energy was generated. This is the most critical factor.

Carbon Intensity (gCO2e / kWh): This metric defines how "dirty" the electricity grid is. We will use a slider for "Data Center Energy Mix" with values from sources like the IEA and EPA:

Renewables (Hydro/Solar/Wind): ~20 gCO2e / kWh (Not zero, due to manufacturing and transmission)

Global Average Grid: ~450 gCO2e / kWh

US Average Grid: ~400 gCO2e / kWh

Coal-Powered Grid: ~820 gCO2e / kWh

Formula:
Carbon (gCO2e) = Energy (Wh) / 1000 * Carbon_Intensity (gCO2e / kWh)

Note: We divide by 1000 to convert our query's Wh to kWh to match the intensity metric.

Example (Medium Model on US Grid):
1.5 Wh / 1000 * 400 gCO2e/kWh = 0.6 gCO2e per query

3. Water Calculation (L per Query)

The "hidden" water cost is for data center cooling. AI servers run incredibly hot and require massive amounts of water (either directly for evaporative cooling or indirectly via the power plants generating their electricity).

Water Usage Factor (L / kWh): This is the amount of water consumed per kilowatt-hour of energy used. Google's 2023 environmental report states an average of 1.1 Liters per kWh for its data centers. We will use this as a configurable default.

Formula:
Water (L) = Energy (Wh) / 1000 * Water_Usage_Factor (L / kWh)

Example (Medium Model @ 1.1 L/kWh):
1.5 Wh / 1000 * 1.1 L/kWh = 0.00165 L per query

This seems tiny, but over billions of queries, it adds up to millions of liters.

Conclusion

This model demonstrates that the most significant levers for reducing AI's environmental impact are:

Energy Efficiency: Building smaller, more efficient models.

Clean Energy: Powering data centers with 100% renewable energy, which dramatically slashes the carbon footprint even if the energy use remains high.