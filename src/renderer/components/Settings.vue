<template>
  <div>
    <div class="title">Settings</div>
    <div class="settings-list">
      <div class="setting">
        <div class="name">Node Version:</div>
        <div class="value">{{ node }}</div>
      </div>
      <div class="setting">
        <div class="name">Proxy:</div>
        <div class="value">{{ proxy.enabled }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'settings',
    data() {
      return {
        proxy: { enabled: false },
        node: process.versions.node,
      };
    },
  };
</script>

<style scoped>
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>
