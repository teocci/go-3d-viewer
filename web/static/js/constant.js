/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-13
 */

let viewerModule

const STL_FILE = '3d/sample.stl'
const OBJ_FILE = '3d/monkey.obj'
const FBX_FILE = '3d/sample-1.fbx'
const PYL_FILE = '3d/example.stl'

// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = {type: 'change'}
const _startEvent = {type: 'start'}
const _endEvent = {type: 'end'}