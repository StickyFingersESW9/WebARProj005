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


// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight;


//////////////////////////////////////////////////////////////////////////////////
//    Init
//////////////////////////////////////////////////////////////////////////////////

// init renderer
var renderer  = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setPixelRatio( window.devicePixelRatio );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );

//window.addEventListener( 'resize', onWindowResize, false );

// array of functions fr the rendering loop
var onRenderFcts= [];

// init scene and camera
var scene = new THREE.Scene();
  
//////////////////////////////////////////////////////////////////////////////////
//    Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
//var camera = new THREE.Camera();
//scene.add(camera);
const fov = 60.0;
const aspect = width / height;
const nearClip = 0.1;
const farClip = 1000.0;
const camera = new THREE.PerspectiveCamera( fov, aspect, nearClip, farClip );
camera.position.set( 0, 0, 0 );

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
    //arToolkitSource.copySizeTo(renderer.domElement);
}


//////////////////////////////////////////////////////////////////////////////////
//    add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

/*
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
    //mesh.rotation.x += Math.PI*delta
})
*/
const stumpPath = [
    'imgs/baseball_dome.png',
    'imgs/cheerleader_woman.png',
    'imgs/enjin_sports_man.png',
    'imgs/sport_volleyball.png',
    'imgs/sports_ouen.png',
    'imgs/sports_volleyball_man_atack.png',
    'imgs/trophy_girl.png',
];

var stampArray = [];
const count = 6;
const distance = 300;
for ( var i = 0 ; i < count ; ++i )
{
    var stamp = CreatePolygon( new THREE.TextureLoader().load( stumpPath[i] ) );
    var angle = i * 360 / count;
    var x = distance * Math.sin( angle / 180.0 * Math.PI );
    var z = distance * Math.cos( angle / 180.0 * Math.PI );
    stamp.position.set( x, 0, z );
    //stamp.scale.set( 0.5, 1, 1 );
    //stamp.rotation.set( 0, angle, 0 );
    scene.add( stamp );
    stampArray.push( stamp );
}


var cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
var params = { color: 0x0000ff };	// blue
//var params = { color: 0x00ff00 };	// green
//var params = { color: 0xff0000 };	// red
var cubeMaterial = new THREE.MeshBasicMaterial( params );
var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
scene.add( cube );
cube.position.set( 0, 0, 50 );



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
        //console.log( 'A=' + gcontrols );
        gcontrols.connect();
        gcontrols.update();
    }
    else
    {
        //console.log( 'B=' + controls );
        //box.rotation.y += 0.05 * Math.PI / 180;
        controls.update();
    }

    for ( let val of stampArray )
    {
        // val.quaternion.copy(this.camera.quaternion); // こちらでも動く
        val.rotation.setFromRotationMatrix( camera.matrix );
    }
})


function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function CreatePolygon( texture )
{
    const width = 100;
    const height = 100;
    var planeGeometry = new THREE.PlaneGeometry( width, height, 0 );
    var planeMaterial = new THREE.MeshBasicMaterial( { map: texture, overdraw: true, side:THREE.DoubleSide } );
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    return plane;
}