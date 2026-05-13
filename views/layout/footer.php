        </main>
    </div>
    <!-- Initialize Lucide Icons -->
    <script>
      lucide.createIcons();
      
      async function updatePendiente(id, field, element) {
          const value = element.value;
          element.disabled = true;
          try {
              const res = await fetch('index.php?action=pendiente_inline_update', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({id, field, value})
              });
              const data = await res.json();
              if (data.success) {
                  element.style.borderColor = 'green';
                  setTimeout(() => element.style.borderColor = '', 2000);
              } else {
                  alert(data.message || 'Error al actualizar');
              }
          } catch (e) {
              alert('Error de red al actualizar');
          }
          element.disabled = false;
      }
    </script>
</body>
</html>
