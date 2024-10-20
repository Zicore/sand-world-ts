function createPlane(width, height, widthSegments, heightSegments, color = 0x2077ff) {
    const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, wireframe: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
    return plane;
}