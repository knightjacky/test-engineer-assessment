// Alpine.js store for global state
document.addEventListener('alpine:init', () => {
  Alpine.store('standardLabels', []);

  Alpine.data('labelMapping', () => ({
    mappings: [],
    error: null,

    async saveMappings() {
      if (this.mappings.length === 0) {
        this.error = 'Please create at least one mapping before saving.';
        return;
      }

      try {
        const response = await fetch('/mappings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mappings: this.mappings }),
        });

        if (!response.ok) {
          throw new Error('Failed to save mappings');
        }

        // Refresh visualization
        htmx.trigger('#visualization-container', 'load');
        
        // Clear mappings and error
        this.mappings = [];
        this.error = null;
      } catch (error) {
        this.error = error.message;
      }
    },

    addMapping(customLabel, standardLabelId) {
      if (!customLabel) {
        this.error = 'Please select a custom label';
        return;
      }
      this.error = null;
      this.mappings.push({ customLabel, standardLabelId: null });
    },

    updateStandardLabel(standardLabelId) {
      if (this.mappings.length === 0) {
        this.error = 'Please select a custom label first';
        return;
      }
      this.error = null;
      this.mappings[this.mappings.length - 1].standardLabelId = standardLabelId;
    },

    removeMapping(index) {
      this.mappings.splice(index, 1);
    },

    getStandardLabelName(standardLabelId) {
      const label = this.$store.standardLabels.find(l => l.id == standardLabelId);
      return label ? `${label.label} (${label.category})` : 'Select standard label';
    }
  }));
});

// Wait for DOM to be ready before adding HTMX error handler
document.addEventListener('DOMContentLoaded', () => {
  // HTMX error handling
  document.body.addEventListener('htmx:error', (evt) => {
    console.error('HTMX Error:', evt.detail.error);
    const errorMessage = evt.detail.error || 'An error occurred. Please try again.';
    
    // Show error in UI instead of alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-4 right-4';
    errorDiv.textContent = errorMessage;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  });
});