var isSmartPhone = false;

var ua = navigator.userAgent;
if ( ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 )
{
    isSmartPhone = true;
}
else if ( ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0 )
{
    isSmartPhone = true;
}

//////////////////////////////////////////////////////////////////////////////////
//    Init
//////////////////////////////////////////////////////////////////////////////////

// init renderer
var renderer  = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( 640, 480 );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );

// array of functions fr the rendering loop
var onRenderFcts= [];

// init scene and camera
var scene = new THREE.Scene();
  
//////////////////////////////////////////////////////////////////////////////////
//    Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
var camera = new THREE.Camera();
scene.add(camera);

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////

var arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam 
    sourceType : 'webcam',

    // // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',    

    // to read from a video
    // sourceType : 'video',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',   
})

arToolkitSource.init(function onReady(){
    onResize()
})

// handle resize
window.addEventListener('resize', function(){
    onResize()
})
function onResize(){
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
}


//////////////////////////////////////////////////////////////////////////////////
//    add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

// add a torus knot 
var geometry  = new THREE.CubeGeometry(1,1,1);
var material  = new THREE.MeshNormalMaterial({
    transparent : true,
    opacity: 0.5,
    side: THREE.DoubleSide
}); 
var mesh  = new THREE.Mesh( geometry, material );
mesh.position.y = geometry.parameters.height/2
//scene.add( mesh );

var geometry  = new THREE.TorusKnotGeometry(0.3,0.1,64,16);
var material  = new THREE.MeshNormalMaterial(); 
var mesh  = new THREE.Mesh( geometry, material );
mesh.position.y = 0.5
scene.add( mesh );

onRenderFcts.push(function(delta){
    mesh.rotation.x += Math.PI*delta
})


if( isSmartPhone )
{
    var gcontrols = new THREE.DeviceOrientationControls( camera, renderer.domElement );
}
else
{
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
}

//////////////////////////////////////////////////////////////////////////////////
//    render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

// render the scene
onRenderFcts.push(function(){
    // Render the see through camera scene
    renderer.clear()

    renderer.render( scene, camera );
})

// run the rendering loop
var lastTimeMsec= null;
requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec  = nowMsec;
    // call each update function
        onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec/1000, nowMsec/1000);
    })

    if ( isSmartPhone )
    {
        gcontrols.connect();
        gcontrols.update();
    }
    else
    {
        //box.rotation.y += 0.05 * Math.PI / 180;
        controls.update();
    }
})