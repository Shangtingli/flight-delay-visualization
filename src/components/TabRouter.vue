<template>
    <div>
        <md-tabs md-sync-route>
            <md-tab id="tab-home" md-label="Home" to="/" exact></md-tab>
            <md-tab id="tab-map" md-label="Map" to="/map"></md-tab>
            <md-tab id="tab-summary" md-label="Summary" to="/summary"></md-tab>
            <md-tab id="tab-suggestion" md-label="Recommendation" to="/suggestion"></md-tab>
        </md-tabs>
    </div>
</template>

<script>
    export default {
        name: 'TabRouter'
    }
</script>