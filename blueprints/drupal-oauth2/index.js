/* eslint-env node */

var fs          = require('fs-extra');
var path        = require('path');
var chalk       = require('chalk');
var EmberRouterGenerator = require('ember-router-generator');

module.exports = {
  description: 'Generates a route, login form, and additional code for authenticating against a Drupal backend using OAuth 2.0.',
  normalizeEntityName: function(){
    return "drupal-oauth2";
  },

  availableOptions: [
    {
      name: 'path',
      type: String,
      default: ''
    },
    {
      name: 'skip-router',
      type: Boolean,
      default: false
    }
  ],

  beforeInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-simple-auth', target: '^1.2.1' }
      ]
    });
  },

  afterInstall: function(options) {
    updateRouter.call(this, 'add', options);
  },

  afterUninstall: function(options) {
    updateRouter.call(this, 'remove', options);
  }
};

function updateRouter(action, options) {
  var name = 'login';
  var actionColorMap = {
    add: 'green',
    remove: 'red'
  };
  var color = actionColorMap[action] || 'gray';

  writeRoute(action, name, options);

  this.ui.writeLine('updating router');
  this._writeStatusToUI(chalk[color], action + ' route', name);
}

function findRouter(options) {
  var routerPathParts = [options.project.root];

  routerPathParts = routerPathParts.concat(['app', 'router.js']);

  return routerPathParts;
}

function writeRoute(action, name, options) {
  var routerPath = path.join.apply(null, findRouter(options));
  var source = fs.readFileSync(routerPath, 'utf-8');

  var routes = new EmberRouterGenerator(source);
  var newRoutes = routes[action](name, options);

  fs.writeFileSync(routerPath, newRoutes.code());
}
