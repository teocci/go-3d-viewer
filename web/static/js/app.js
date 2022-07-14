/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */
import ViewerModule from './ViewerModule.js'

window.onload = () => {
    console.log('init')

    viewerModule = ViewerModule.instance
    viewerModule.loadViewers()
}