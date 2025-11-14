#!/usr/bin/env python3
"""
Quick verification that the game works in interactive mode.
This simulates a user session.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from quantum_garden import QuantumGarden

def verify_game():
    """Verify all game features work."""
    print("🔍 Verifying Quantum Garden Implementation\n")
    
    results = []
    
    # Test 1: Garden Creation
    print("✓ Test 1: Creating quantum garden...")
    garden = QuantumGarden()
    garden.initialize_garden()
    assert len(garden.states) == 3, "Should have 3 initial states"
    results.append("Garden initialization")
    
    # Test 2: Quantum States
    print("✓ Test 2: Verifying quantum states...")
    total_prob = sum(s.probability for s in garden.states)
    assert abs(total_prob - 1.0) < 0.01, "Total probability should be 1.0"
    results.append("Quantum superposition")
    
    # Test 3: Planting
    print("✓ Test 3: Planting seeds...")
    garden.plant_seed(5, 5)
    for state in garden.states:
        assert (5, 5) in state.plants, "Seed should exist in all states"
    results.append("Cross-state planting")
    
    # Test 4: Evolution
    print("✓ Test 4: Time evolution...")
    garden.evolve_all_states(10.0)
    for state in garden.states:
        assert state.age == 10.0, "All states should have evolved"
    results.append("Temporal evolution")
    
    # Test 5: State Collapse
    print("✓ Test 5: Collapsing quantum state...")
    garden.collapse_state(0)
    assert len(garden.states) == 1, "Should have 1 state after collapse"
    assert garden.states[0].probability == 1.0, "Collapsed state should have 100% probability"
    results.append("Observer effect (collapse)")
    
    # Test 6: Reality Splitting
    print("✓ Test 6: Creating superposition...")
    garden.create_superposition()
    assert len(garden.states) == 3, "Should have 3 states after split"
    assert garden.reality_splits == 1, "Should track reality splits"
    results.append("Reality splitting")
    
    # Test 7: Rendering
    print("✓ Test 7: ASCII rendering...")
    render = garden.render_state(0)
    assert "Quantum State" in render, "Should render state info"
    assert "╔" in render, "Should have border characters"
    results.append("ASCII art generation")
    
    # Test 8: Statistics
    print("✓ Test 8: Statistics tracking...")
    stats = garden.get_stats()
    assert "STATISTICS" in stats, "Should show statistics"
    assert str(garden.total_observations) in stats, "Should include observations"
    results.append("Statistics system")
    
    # Test 9: Save/Load
    print("✓ Test 9: Save and load...")
    test_file = "/tmp/verify_save.json"
    garden.save(test_file)
    assert os.path.exists(test_file), "Save file should exist"
    
    loaded = QuantumGarden.load(test_file)
    assert loaded is not None, "Should load successfully"
    assert len(loaded.states) == len(garden.states), "Should preserve states"
    os.remove(test_file)
    results.append("Persistent storage")
    
    # Test 10: Plant Mutations
    print("✓ Test 10: Plant mutation system...")
    from quantum_garden import QuantumState
    state = QuantumState("test", 1.0)
    mutated = state.mutate_plant('🌱')
    assert mutated is not None, "Should produce mutation"
    results.append("Plant mutations")
    
    print("\n" + "="*50)
    print("ALL VERIFICATION TESTS PASSED ✓")
    print("="*50)
    print("\nImplemented Features:")
    for i, feature in enumerate(results, 1):
        print(f"  {i}. {feature}")
    
    print("\n🎮 Quantum Garden is fully functional and ready to play!")
    print("\nRun: python3 quantum_garden.py")
    print()

if __name__ == "__main__":
    try:
        verify_game()
    except AssertionError as e:
        print(f"\n❌ Verification failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
