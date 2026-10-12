# Agrega el widget (extensión de WidgetKit) al proyecto de iPhone que genera Capacitor.
# Uso (en la compilación): ruby tools/agregar-widget.rb ios/App/App.xcodeproj EQUIPO VERSION BUILD
require 'xcodeproj'
require 'fileutils'

proj_path, equipo, version, build = ARGV
proj = Xcodeproj::Project.open(proj_path)
app = proj.targets.find { |t| t.name == 'App' } or abort 'No encuentro el target App'
dir_proj = File.dirname(proj_path)                      # ios/App
origen = File.expand_path('../native/ios/AudiolibrosWidget', __dir__)
destino = File.join(dir_proj, 'AudiolibrosWidget')
FileUtils.rm_rf(destino); FileUtils.cp_r(origen, destino)
FileUtils.mv(File.join(destino, 'App.entitlements'), File.join(dir_proj, 'App', 'App.entitlements'))

w = proj.new_target(:app_extension, 'AudiolibrosWidget', :ios, '16.0')
grupo = proj.main_group.new_group('AudiolibrosWidget', 'AudiolibrosWidget')
w.add_file_references([grupo.new_file('AudiolibrosWidget.swift')])
grupo.new_file('Info.plist'); grupo.new_file('AudiolibrosWidget.entitlements')
%w[WidgetKit SwiftUI].each { |fw| w.add_system_framework(fw) }

w.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.dmithbuilds.audiolibros.widget'
  s['PRODUCT_NAME'] = '$(TARGET_NAME)'
  s['INFOPLIST_FILE'] = 'AudiolibrosWidget/Info.plist'
  s['GENERATE_INFOPLIST_FILE'] = 'NO'
  s['CODE_SIGN_ENTITLEMENTS'] = 'AudiolibrosWidget/AudiolibrosWidget.entitlements'
  s['CODE_SIGN_STYLE'] = 'Automatic'
  s['DEVELOPMENT_TEAM'] = equipo
  s['SWIFT_VERSION'] = '5.0'
  s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
  s['TARGETED_DEVICE_FAMILY'] = '1'
  s['MARKETING_VERSION'] = version
  s['CURRENT_PROJECT_VERSION'] = build
  s['SKIP_INSTALL'] = 'YES'
  s['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  s['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  s['ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME'] = ''
end

# La app usa el mismo grupo compartido y lleva el widget adentro.
app.build_configurations.each { |c| c.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements' }
proj.main_group.find_subpath('App', false)&.new_file('App.entitlements')
app.add_dependency(w)
emb = app.copy_files_build_phases.find { |p| p.name == 'Embed App Extensions' } || app.new_copy_files_build_phase('Embed App Extensions')
emb.dst_subfolder_spec = '13'   # PlugIns
bf = emb.add_file_reference(w.product_reference, true)
bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

proj.save
puts 'Widget agregado: ' + w.name
