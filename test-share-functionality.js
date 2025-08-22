// Script de prueba para verificar la funcionalidad de compartir
// Ejecutar en la consola del navegador en la página de formularios

// Función para probar la generación de tokens
async function testShareFunctionality() {
  console.log('=== Iniciando pruebas de funcionalidad de compartir ===');
  
  // Importar el servicio
  const { FormService } = await import('./lib/supabase/form-service.ts');
  const formService = new FormService();
  
  try {
    // 1. Obtener formularios del usuario
    console.log('1. Obteniendo formularios del usuario...');
    const forms = await formService.getUserForms();
    console.log('Formularios encontrados:', forms.length);
    
    if (forms.length === 0) {
      console.log('❌ No hay formularios para probar');
      return;
    }
    
    const testForm = forms[0];
    console.log('Formulario de prueba:', testForm.id, testForm.title);
    
    // 2. Generar token de compartir
    console.log('2. Generando token de compartir...');
    const token = await formService.generateShareToken(testForm.id);
    console.log('Token generado:', token);
    
    if (!token) {
      console.log('❌ No se pudo generar el token');
      return;
    }
    
    // 3. Verificar que el formulario se puede obtener por token
    console.log('3. Verificando acceso público por token...');
    const publicForm = await formService.getFormByShareToken(token);
    console.log('Formulario público obtenido:', publicForm);
    
    if (publicForm) {
      console.log('✅ Funcionalidad de compartir funcionando correctamente');
      console.log('URL de compartir:', `${window.location.origin}/form/${token}`);
    } else {
      console.log('❌ No se pudo obtener el formulario por token');
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Función para verificar la base de datos
async function checkDatabase() {
  console.log('=== Verificando estructura de base de datos ===');
  
  const { createClient } = await import('./lib/supabase/client.ts');
  const supabase = createClient();
  
  try {
    // Verificar tabla form_configs
    const { data: tableInfo, error: tableError } = await supabase
      .from('form_configs')
      .select('id, title, share_token, is_public')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accediendo a form_configs:', tableError);
      return;
    }
    
    console.log('✅ Tabla form_configs accesible');
    
    // Verificar función RPC
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('generate_share_token');
    
    if (rpcError) {
      console.error('❌ Error en función generate_share_token:', rpcError);
    } else {
      console.log('✅ Función generate_share_token funcionando:', rpcTest);
    }
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  }
}

// Ejecutar pruebas
console.log('Para ejecutar las pruebas, usa:');
console.log('testShareFunctionality() - Prueba completa de funcionalidad');
console.log('checkDatabase() - Verifica estructura de BD');

// Exportar funciones para uso en consola
window.testShareFunctionality = testShareFunctionality;
window.checkDatabase = checkDatabase;