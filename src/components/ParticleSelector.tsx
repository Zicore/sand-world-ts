import React, { useState } from 'react';

interface ParticleSelectorProps {
  onSelectParticle: (particleType: string) => void;
}

const ParticleSelector: React.FC<ParticleSelectorProps> = ({ onSelectParticle }) => {
  const [selectedParticle, setSelectedParticle] = useState<string>('Sand');

  const handleParticleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const particleType = e.target.value;
    setSelectedParticle(particleType);
    onSelectParticle(particleType);  // Notify parent of the selection
  };

  return (
    <div>
      <h3>Select Particle Type</h3>
      <select title='Particle Selection' value={selectedParticle} onChange={handleParticleChange}>
        <option value="Sand">Sand</option>
        <option value="Water">Water</option>
        <option value="Air">Air</option>
      </select>
      <p>Selected Particle: {selectedParticle}</p>
    </div>
  );
};

export default ParticleSelector;
