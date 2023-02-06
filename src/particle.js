import * as THREE from 'three';

const PARTICLE_RESOLUTION = 32;

const colors = {
    1: 0xaae3e2,
    2: 0xd9acf5,
}

class Particle {
    constructor(x, y, z, shape, type, size) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.shape = shape;
        this.type = type;
        this.color = colors[type];
        this.size = size;
        this.mass = size;
        this.geometry = new THREE.CircleGeometry(this.size, PARTICLE_RESOLUTION);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x, this.y, this.z);
        this.velocity = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            0,
        );
        this.velocity.normalize().multiplyScalar(2);
    }
    // Should later add customization to the size of the particle, and the shape of the particle, along with getters/setters
}

const createParticle = (type, shape, position, size) => {
    return new Particle(position.x, position.y, position.z, shape, type, size);
};

const elasticCollision = (particle1, particle2) => {
    const velocityDiff = particle1.velocity.clone().sub(particle2.velocity);
    const direction = particle1.mesh.position.clone().sub(particle2.mesh.position).normalize();
    const dotProduct = velocityDiff.dot(direction);
    const scalar = dotProduct / (particle1.mass + particle2.mass);
    const impulse = direction.multiplyScalar(scalar);
    particle1.velocity.sub(impulse.clone().multiplyScalar(particle1.mass));
    particle2.velocity.add(impulse.clone().multiplyScalar(particle2.mass));
}

export let timeStep = 1; // * speed;

let usePeriodicBoundary = false;

const toggleBoundaryConditions = () => {
    usePeriodicBoundary = !usePeriodicBoundary;
};

const particles = [];

const interaction_matrix = [[-10, -10], [-10, -10]];

const init = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Resize function
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // Listen for resize event
    window.addEventListener("resize", onWindowResize, false);
    
    // Scroll function
    function onMouseWheel(event) {
        const delta = event.deltaY;
        camera.position.z += delta * 0.05;
    }

    // Listen for mouse wheel event
    window.addEventListener("wheel", onMouseWheel, false);

    const N = 10;
    for (let i = 0; i < N; i++) {
        const shape = "circle";
        const type = Math.random() > 0.6 ? 1 : 2; 
        const x = Math.random() * window.innerWidth - window.innerWidth / 2;
        const y = Math.random() * window.innerHeight - window.innerHeight / 2;
        const z = 0;
        const size = 10; // Math.random() * 10 + 1;
        const particle = createParticle(type, shape, { x, y, z }, size);

        particles.push(particle);
        scene.add(particle.mesh);
    }
  
    camera.position.z = 500;
    const animate = () => {
        requestAnimationFrame(animate);

        particles.forEach((particle, index1) => {
            // First, update the velocity vector
            const remainingParticles = particles.slice(index1 + 1);
            particles.forEach((otherParticle, index2) => {
                if (index1 === index2) {
                    return;
                }
                const distance = 0.1*particle.mesh.position.distanceTo(otherParticle.mesh.position);
                
                // const overlapping = distance < particle.size + otherParticle.size;
                // if (overlapping) {
                //     elasticCollision(particle, otherParticle);
                // }

                const interaction = interaction_matrix[particle.type - 1][otherParticle.type - 1];
                const force = 2*interaction / (distance * distance) + 10/(distance * distance * distance);
                const direction = otherParticle.mesh.position.clone().sub(particle.mesh.position).normalize();
                particle.velocity.sub(direction.multiplyScalar(force/particle.mass));
            });


            // Then, update the position vector according to the velocity vector
            particle.mesh.position.add(particle.velocity.multiplyScalar(timeStep));
            
            if (usePeriodicBoundary) {
                // periodic boundary condition logic
                if (particle.mesh.position.x > window.innerWidth / 2) {
                    particle.mesh.position.x -= window.innerWidth;
                    } else if (particle.mesh.position.x < -window.innerWidth / 2) {
                    particle.mesh.position.x += window.innerWidth;
                    }
                if (particle.mesh.position.y > window.innerHeight / 2) {
                    particle.mesh.position.y -= window.innerHeight;
                    } else if (particle.mesh.position.y < -window.innerHeight / 2) {
                    particle.mesh.position.y += window.innerHeight;
                    }
            } else {
                // collision boundary condition logic
                if (particle.mesh.position.x > window.innerWidth / 2 || particle.mesh.position.x < -window.innerWidth / 2) {
                    particle.velocity.x = -particle.velocity.x;
                }
                if (particle.mesh.position.y > window.innerHeight / 2 || particle.mesh.position.y < -window.innerHeight / 2) {
                    particle.velocity.y = -particle.velocity.y;
                }
            }
        });

        renderer.render(scene, camera);
    };
    animate();
};
  
init();
  
export { toggleBoundaryConditions };