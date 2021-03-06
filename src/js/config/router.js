/*
 * config/router.js
 *
 * Defines the routes for the application.
 *
 */
angular.module(_APP_).config([
  '$routeProvider',
  function($routeProvider) {

    // Define routes here.
    $routeProvider
      // .when('/', {
      //   templateUrl: 'html/partials/home/index.html',
      //   controller: 'HomeController'
      // })
      .when('/', {
        templateUrl: 'html/partials/map/index.html',
        controller: 'MapController',
        resolve: {
          trails: function(MapService) {
            return MapService.get();
          }
        }
      })
      .otherwise({ redirectTo: '/' });

  }
]);

