dojo.require("dojox.gfx3d");

// Global
var angles = {x: 30, y: -30, z: 0};
var view = null;

jsCubeIntersector = function(){
    // Editor de variables
    var textarea = document.getElementById('code');
    this.editor = new CodeMirror(CodeMirror.replace(textarea), {
        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
        stylesheet: "js/CodeMirror-0.67/css/jscolors.css",
        path: "js/CodeMirror-0.67/js/",
        content: document.getElementById("code").value,
        lineNumbers: true,
        height: "100%"
    });

    

    this.getBottom = function (dataPoint){
      var halfW = dataPoint.w/2;

      var point = { x: dataPoint.x - halfW, y: dataPoint.y - halfW, z: dataPoint.z - halfW };

      return point;
    }

    this.getTop = function (dataPoint){
      var halfW = dataPoint.w/2;

      var point = { x: dataPoint.x + halfW, y: dataPoint.y + halfW, z: dataPoint.z + halfW };

      return point;
    }

    this.getBottomIntersection = function (bottomA, bottomB){
      var bottomIntersection = {x: null, y: null, z: null}

      // x-edge
      if (bottomA.x >= bottomB.x){
        bottomIntersection.x = bottomA.x;
      } else {
        bottomIntersection.x = bottomB.x;
      }

      // y-edge
      if (bottomA.y >= bottomB.y){
        bottomIntersection.y = bottomA.y;
      } else {
        bottomIntersection.y = bottomB.y;
      }

      // z-edge
      if (bottomA.z >= bottomB.z){
        bottomIntersection.z = bottomA.z;
      } else {
        bottomIntersection.z = bottomB.z;
      }

      return bottomIntersection;
    }

    this.getTopIntersection = function (topA, topB){
      var topIntersection = {x: null, y: null, z: null}

      // x-edge
      if (topA.x <= topB.x){
        topIntersection.x = topA.x;
      } else {
        topIntersection.x = topB.x;
      }

      // y-edge
      if (topA.y <= topB.y){
        topIntersection.y = topA.y;
      } else {
        topIntersection.y = topB.y;
      }

      // z-edge
      if (topA.z <= topB.z){
        topIntersection.z = topA.z;
      } else {
        topIntersection.z = topB.z;
      }

      return topIntersection;
    }

    this.intersectionBeetwen = function (A, B){
      console.log(A, B);
      var bottomIntersection = this.getBottomIntersection(A.bottom, B.bottom);
      var topIntersection = this.getTopIntersection(A.top, B.top);

      if (
        bottomIntersection.x < topIntersection.x ||
        bottomIntersection.y < topIntersection.y ||
        bottomIntersection.z < topIntersection.z
      ) {
        // Ok! --> A and B intersect
        return { bottom: bottomIntersection, top: topIntersection }
      } else {
        // Fail! --> A and B not intersect
        return null;
      }
    }

    this.rotate = function() {
      var m = dojox.gfx3d.matrix;
      var that = this;

      if(dojo.byId('rx').checked){
              angles.x += 1;
      }
      if(dojo.byId('ry').checked){
              angles.y += 1;
      }
      if(dojo.byId('rz').checked){
              angles.z += 1;
      }
      var t = m.normalize([
              m.cameraTranslate(-300, -200, 0),
              m.cameraRotateXg(angles.x),
              m.cameraRotateYg(angles.y),
              m.cameraRotateZg(angles.z)
              ]);
      // console.debug(t);
      view.setCameraTransform(t);
      view.render();
    }

    this.makeObjects = function(){
      var that = this;
      var surface = dojox.gfx.createSurface("surface", 500, 500);
      view = surface.createViewport();

      view.setLights(
        [{ direction: { x: -10, y: -5, z: 5 }, color: "white"}],
        { color:"white", intensity: 2 },
        "white"
      );

      var xaxis = [{x: 0, y: 0, z: 0}, {x: 300, y: 0, z: 0}];
      var yaxis = [{x: 0, y: 0, z: 0}, {x: 0, y: 300, z: 0}];
      var zaxis = [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 300}];

      var m = dojox.gfx3d.matrix;

      view.createEdges(xaxis).setStroke({color: "red", width: 1});
      view.createEdges(yaxis).setStroke({color: "green", width: 1});
      view.createEdges(zaxis).setStroke({color: "blue", width: 1});
      
      lastIntersect = null;
      var cs = [];
      dataCubes.forEach(function(e, i){
        var c = { bottom: that.getBottom(e), top: that.getTop(e) };
        var cube = view.createCube(c).setStroke({color: e.color, width: 1});
        //cs[i] = c;
        if (i != 0){
          var intersect = that.intersectionBeetwen(lastIntersect, c);
          lastIntersect = intersect;
          //if (intersect != null){
          //  var cubeIntersect = view.createCube(intersect).setFill({ type: "plastic", finish: "dull", color: "blue" });
          //}
        } else {
          lastIntersect = c;
        }
      });

      if (lastIntersect != null){
        var cubeIntersect = view.createCube(lastIntersect).setFill({ type: "plastic", finish: "dull", color: "blue" });
      }

      var camera = dojox.gfx3d.matrix.normalize([
        m.cameraTranslate(-300, -200, 0),
        m.cameraRotateXg(angles.x),
        m.cameraRotateYg(angles.y),
        m.cameraRotateZg(angles.z)
      ]);

      view.applyCameraTransform(camera);
      view.render();
      setInterval(that.rotate, 50);
    }

    this.init = function(){
        eval(this.getCode());
    }

    this.execute = function(){
        this.init();

        this.makeObjects();

        this.cleanVars();
    }

    this.cleanVars = function(){
        dataCubes = null;i
    }

    this.getCode = function(){
        return this.editor.getCode();
    }

    this.redo = function(){
        this.editor.redo();
    }

    this.undo = function(){
        this.editor.undo();
    }
}

