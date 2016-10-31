const request = nodeRequire('request-promise');
let ipcRenderer = nodeRequire('electron').ipcRenderer;
let remoteProxyConfig = nodeRequire('electron').remote;
const URL = nodeRequire('url');
let configStore = remoteProxyConfig.getGlobal("config");

pullConfigValues();

$('#cancelProxyConfigButton').click(function () {
  let curWindow = remoteProxyConfig.getCurrentWindow();
  curWindow.hide();
});

$('#saveProxyConfigButton').click(function () {
  let host = $('#proxyConfigForm input[name="host"]').val();
  let port = $('#proxyConfigForm input[name="port"]').val();
  let username = $('#proxyConfigForm input[name="username"]').val();
  let password = $('#proxyConfigForm input[name="password"]').val();
  if (!host) {
    Materialize.toast("Proxy Disabled! Restarting soon...", 6000);
    pushConfigValues("", "", "", "");
    setTimeout(function () {
      ipcRenderer.sendSync('proxy-restart', 'disabled proxy!');
    }, 5000);
  } else {
    if (testProxy(host, port, username, password)) {
      Materialize.toast("Proxy Connection Test Succeeded! Restarting soon....", 6000);
      pushConfigValues(host, port, username, password);
      setTimeout(function () {
        ipcRenderer.sendSync('proxy-restart', 'new proxy!');
      }, 5000);
    } else {
      Materialize.toast("Proxy Connection Test Failed. Please check configuration.", 5000);
    }
  }
});


function testProxy(host, port, username, password) {
  let url = URL.parse(host)
  url.port = port;
  if (username && password) {
    url.auth = username + ":" + password;
  }
  return request({
    url : "www.google.com",
    proxy : URL.format(url),
    timeout: 10000,
    followRedirect : false
  }).then(function () {
    console.log('success');
    return true;
  }).catch(function () {
    console.log('failure');
    return false;
  });
}

function pullConfigValues() {
  let host = configStore.get('proxy.host') || '';
  let port = configStore.get('proxy.port') || '';
  let username = configStore.get('proxy.username') || '';
  let password = configStore.get('proxy.password') || '';
  $('#proxyConfigForm input[name="host"]').val(host);
  $('#proxyConfigForm input[name="port"]').val(port);
  $('#proxyConfigForm input[name="username"]').val(username);
  $('#proxyConfigForm input[name="password"]').val(password);
}

function pushConfigValues(host, port, username, password) {
  configStore.set('proxy.host', host);
  configStore.set('proxy.port', port);
  configStore.set('proxy.username', username);
  configStore.set('proxy.password', password);
}
