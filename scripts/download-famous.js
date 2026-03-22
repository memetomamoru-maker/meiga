// download-famous.js
// 名画100選の画像をWikimedia Commonsからダウンロードしてimages/famous/に保存する
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'famous');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const PAINTINGS = [
  ['mona_lisa.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'],
  ['primavera.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1024px-Botticelli-primavera.jpg'],
  ['school_of_athens.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg'],
  ['rembrandt_self_portrait.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg'],
  ['girl_pearl_earring.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg'],
  ['milkmaid_vermeer.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Jan_Vermeer_-_The_Milkmaid_%28c._1658%29_-_Rijksmuseum.jpg/800px-Jan_Vermeer_-_The_Milkmaid_%28c._1658%29_-_Rijksmuseum.jpg'],
  ['view_of_delft.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vermeer-view-of-delft.jpg/1280px-Vermeer-view-of-delft.jpg'],
  ['arnolfini_portrait.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg'],
  ['tower_of_babel.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg'],
  ['garden_earthly_delights.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Garden_of_earthly_delights.jpg/1280px-The_Garden_of_earthly_delights.jpg'],
  ['the_ambassadors.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/800px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg'],
  ['las_meninas.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Las_Meninas_01.jpg/800px-Las_Meninas_01.jpg'],
  ['saturn_devouring.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg/800px-Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg'],
  ['death_of_socrates.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/David_-_The_Death_of_Socrates.jpg/1280px-David_-_The_Death_of_Socrates.jpg'],
  ['death_of_marat.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Death_of_Marat_by_David.jpg/800px-Death_of_Marat_by_David.jpg'],
  ['raft_of_medusa.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg/1280px-JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg'],
  ['wanderer_fog.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg'],
  ['the_gleaners.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg/1280px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg'],
  ['impression_sunrise.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg'],
  ['water_lilies_monet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'],
  ['olympia.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg/1280px-Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg'],
  ['starry_night.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'],
  ['sunflowers_vangogh.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg'],
  ['irises_vangogh.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Irises-Vincent_van_Gogh.jpg/1280px-Irises-Vincent_van_Gogh.jpg'],
  ['the_scream.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'],
  ['american_gothic.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_DeVolson_Wood_-_American_Gothic.jpg/800px-Grant_DeVolson_Wood_-_American_Gothic.jpg'],
  ['washington_crossing.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/1280px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg'],
  ['whistlers_mother.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Whistlers_Mother_high_res.jpg/1024px-Whistlers_Mother_high_res.jpg'],
  ['persistence_memory.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/The_Persistence_of_Memory.jpg/1280px-The_Persistence_of_Memory.jpg'],
  ['last_supper.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg'],
  ['annunciation_leonardo.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Leonardo_da_Vinci_-_Annunciazione_-_Google_Art_Project.jpg/1280px-Leonardo_da_Vinci_-_Annunciazione_-_Google_Art_Project.jpg'],
  ['virgin_of_rocks.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Leonardo_da_Vinci_-_Virgin_of_the_Rocks_%28Louvre%29.jpg/800px-Leonardo_da_Vinci_-_Virgin_of_the_Rocks_%28Louvre%29.jpg'],
  ['birth_of_venus.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg'],
  ['sistine_madonna.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Raphael_-_The_Sistine_Madonna_-_Google_Arts_%26_Culture.jpg/800px-Raphael_-_The_Sistine_Madonna_-_Google_Arts_%26_Culture.jpg'],
  ['doni_tondo.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Tondo_Doni%2C_por_Miguel_%C3%81ngel.jpg/800px-Tondo_Doni%2C_por_Miguel_%C3%81ngel.jpg'],
  ['night_watch.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg'],
  ['anatomy_lesson.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/The_Anatomy_Lesson.jpg/1280px-The_Anatomy_Lesson.jpg'],
  ['peasant_wedding.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Pieter_Bruegel_the_Elder_-_Peasant_Wedding_-_Google_Art_Project_2.jpg/1280px-Pieter_Bruegel_the_Elder_-_Peasant_Wedding_-_Google_Art_Project_2.jpg'],
  ['three_graces_rubens.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/The_Three_Graces%2C_by_Peter_Paul_Rubens%2C_from_Prado_in_Google_Earth.jpg/800px-The_Three_Graces%2C_by_Peter_Paul_Rubens%2C_from_Prado_in_Google_Earth.jpg'],
  ['bacchus_caravaggio.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bacchus_by_Caravaggio_1.jpg/800px-Bacchus_by_Caravaggio_1.jpg'],
  ['musicians_caravaggio.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/The_Musicians_MET_DP-687-001.jpg/1280px-The_Musicians_MET_DP-687-001.jpg'],
  ['supper_emmaus.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Supper_at_Emmaus-Caravaggio_%281601%29.jpg/1280px-Supper_at_Emmaus-Caravaggio_%281601%29.jpg'],
  ['judith_holofernes.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Caravaggio_-_Giuditta_e_Oloferne.jpg/800px-Caravaggio_-_Giuditta_e_Oloferne.jpg'],
  ['third_of_may.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/El_Tres_de_Mayo%2C_by_Francisco_de_Goya%2C_from_Prado_thin_black_margin.jpg/1280px-El_Tres_de_Mayo%2C_by_Francisco_de_Goya%2C_from_Prado_thin_black_margin.jpg'],
  ['maja_desnuda.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Goya_Maja_desnuda2.jpg/1280px-Goya_Maja_desnuda2.jpg'],
  ['venus_adonis_titian.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Titian_Venus_and_Adonis_Getty.jpg/1024px-Titian_Venus_and_Adonis_Getty.jpg'],
  ['bacchus_ariadne.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg/1280px-Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg'],
  ['coronation_napoleon.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg/1280px-Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg'],
  ['oath_horatii.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Jacques-Louis_David_-_Oath_of_the_Horatii_-_Google_Art_Project.jpg/1280px-Jacques-Louis_David_-_Oath_of_the_Horatii_-_Google_Art_Project.jpg'],
  ['liberty_leading.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/1024px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg'],
  ['massacre_chios.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Eug%C3%A8ne_Delacroix_-_Le_Massacre_de_Scio.jpg/800px-Eug%C3%A8ne_Delacroix_-_Le_Massacre_de_Scio.jpg'],
  ['third_class_carriage.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Honor%C3%A9_Daumier_-_The_Third-Class_Carriage_-_Google_Art_Project.jpg/1280px-Honor%C3%A9_Daumier_-_The_Third-Class_Carriage_-_Google_Art_Project.jpg'],
  ['burial_ornans.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg/1280px-Gustave_Courbet_-_A_Burial_at_Ornans_-_Google_Art_Project_2.jpg'],
  ['angelus_millet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jean-Fran%C3%A7ois_Millet_Angelus.jpg/800px-Jean-Fran%C3%A7ois_Millet_Angelus.jpg'],
  ['constable_haywain.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/John_Constable_-_The_Hay_Wain_%281821%29.jpg/1280px-John_Constable_-_The_Hay_Wain_%281821%29.jpg'],
  ['fighting_temeraire.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Fighting_Temeraire%2C_JMW_Turner%2C_National_Gallery.jpg/1280px-The_Fighting_Temeraire%2C_JMW_Turner%2C_National_Gallery.jpg'],
  ['sower_millet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Jean-Fran%C3%A7ois_Millet_-_The_Sower_-_Google_Art_Project.jpg/800px-Jean-Fran%C3%A7ois_Millet_-_The_Sower_-_Google_Art_Project.jpg'],
  ['haystacks_monet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Claude_Monet_-_Stacks_of_Wheat_%28End_of_Summer%29_-_1985.1103_-_Art_Institute_of_Chicago.jpg/1280px-Claude_Monet_-_Stacks_of_Wheat_%28End_of_Summer%29_-_1985.1103_-_Art_Institute_of_Chicago.jpg'],
  ['rouen_cathedral_monet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Claude_Monet_-_Rouen_Cathedral%2C_West_Facade.jpg/800px-Claude_Monet_-_Rouen_Cathedral%2C_West_Facade.jpg'],
  ['dance_moulin_galette.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Google_Art_Project.jpg/1280px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Google_Art_Project.jpg'],
  ['luncheon_boating.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg'],
  ['luncheon_grass.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg/1280px-Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg'],
  ['bar_folies_bergere.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg/1280px-Edouard_Manet%2C_A_Bar_at_the_Folies-Berg%C3%A8re.jpg'],
  ['grande_jatte.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg'],
  ['bathers_asniers.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Georges_Seurat_-_Baigneurs_%C3%A0_Asni%C3%A8res.jpg/1280px-Georges_Seurat_-_Baigneurs_%C3%A0_Asni%C3%A8res.jpg'],
  ['tahitian_women.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Paul_Gauguin_142.jpg/800px-Paul_Gauguin_142.jpg'],
  ['vision_sermon.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Paul_Gauguin_-_Vision_of_the_Sermon_%28Jacob_Wrestling_with_the_Angel%29_-_NG_1643_-_National_Galleries_of_Scotland.jpg/1024px-Paul_Gauguin_-_Vision_of_the_Sermon_%28Jacob_Wrestling_with_the_Angel%29_-_NG_1643_-_National_Galleries_of_Scotland.jpg'],
  ['spirit_dead_watching.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Paul_Gauguin_-_Manao_tupapau_%28The_Spirit_of_the_Dead_Keep_Watch%29.JPG/1024px-Paul_Gauguin_-_Manao_tupapau_%28The_Spirit_of_the_Dead_Keep_Watch%29.JPG'],
  ['self_portrait_cezanne.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Paul_C%C3%A9zanne_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Paul_C%C3%A9zanne_-_Self-Portrait_-_Google_Art_Project.jpg'],
  ['card_players_cezanne.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Les_Joueurs_de_cartes%2C_par_Paul_C%C3%A9zanne.jpg/800px-Les_Joueurs_de_cartes%2C_par_Paul_C%C3%A9zanne.jpg'],
  ['mont_sainte_victoire.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Paul_C%C3%A9zanne_-_Mont_Sainte-Victoire_and_the_Viaduct_of_the_Arc_River_Valley_%28Metropolitan_Museum_of_Art%29.jpg/1280px-Paul_C%C3%A9zanne_-_Mont_Sainte-Victoire_and_the_Viaduct_of_the_Arc_River_Valley_%28Metropolitan_Museum_of_Art%29.jpg'],
  ['large_bathers.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Paul_C%C3%A9zanne%2C_French_-_The_Large_Bathers_-_Google_Art_Project.jpg/1280px-Paul_C%C3%A9zanne%2C_French_-_The_Large_Bathers_-_Google_Art_Project.jpg'],
  ['self_portrait_vangogh.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg'],
  ['potato_eaters.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg/1280px-Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg'],
  ['bedroom_arles.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Vincent_van_Gogh_-_Van_Gogh%27s_Bedroom_in_Arles_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_Van_Gogh%27s_Bedroom_in_Arles_-_Google_Art_Project.jpg'],
  ['night_cafe.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Le_caf%C3%A9_de_nuit_%28The_Night_Caf%C3%A9%29_by_Vincent_van_Gogh.jpeg/1024px-Le_caf%C3%A9_de_nuit_%28The_Night_Caf%C3%A9%29_by_Vincent_van_Gogh.jpeg'],
  ['snap_the_whip.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Winslow_Homer_-_Snap_the_Whip_%28Butler_Institute_of_American_Art%29.jpg/1280px-Winslow_Homer_-_Snap_the_Whip_%28Butler_Institute_of_American_Art%29.jpg'],
  ['carnation_lily.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Carnation%2C_Lily%2C_Lily%2C_Rose_by_John_Singer_Sargent_-_Google_Art_Project.jpg/800px-Carnation%2C_Lily%2C_Lily%2C_Rose_by_John_Singer_Sargent_-_Google_Art_Project.jpg'],
  ['kiss_klimt.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg'],
  ['judith_klimt.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Gustav_Klimt_-_Judith_-_4737_-%C3%96sterreichische_Galerie_Belvedere.jpg/600px-Gustav_Klimt_-_Judith_-_4737_-%C3%96sterreichische_Galerie_Belvedere.jpg'],
  ['adele_klimt.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg/800px-Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg'],
  ['burial_orgaz.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/El_Greco_-_The_Burial_of_the_Count_of_Orgaz.JPG/800px-El_Greco_-_The_Burial_of_the_Count_of_Orgaz.JPG'],
  ['moulin_rouge.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%28Albi%29_Moulin-rouge._La_Goulue_et_Valentin_le_desoss%C3%A9_-_Toulouse-Lautrec_1891_-_Inv.138.jpg/800px-%28Albi%29_Moulin-rouge._La_Goulue_et_Valentin_le_desoss%C3%A9_-_Toulouse-Lautrec_1891_-_Inv.138.jpg'],
  ['ballet_class_degas.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg/800px-Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg'],
  ['dance_matisse.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Matissedance.jpg/1280px-Matissedance.jpg'],
  ['composition_kandinsky.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/1280px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg'],
  ['black_square.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Kazimir_Malevich%2C_1915%2C_Black_Suprematic_Square%2C_oil_on_linen_canvas%2C_79.5_x_79.5%2C_Tretyakov_Gallery%2C_Moscow.jpg/800px-Kazimir_Malevich%2C_1915%2C_Black_Suprematic_Square%2C_oil_on_linen_canvas%2C_79.5_x_79.5%2C_Tretyakov_Gallery%2C_Moscow.jpg'],
  ['broadway_boogie.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg/800px-Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg'],
  ['composition_mondrian.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg/800px-Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg'],
  ['senecio_klee.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Paul_Klee%2C_1922%2C_Senecio%2C_oil_on_gauze%2C_40.3_%C3%97_37.4_cm%2C_Kunstmuseum_Basel.jpg/800px-Paul_Klee%2C_1922%2C_Senecio%2C_oil_on_gauze%2C_40.3_%C3%97_37.4_cm%2C_Kunstmuseum_Basel.jpg'],
  ['embrace_schiele.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Egon_Schiele_-_Die_Umarmung_-_4438_-%C3%96sterreichische_Galerie_Belvedere.jpg/800px-Egon_Schiele_-_Die_Umarmung_-_4438_-%C3%96sterreichische_Galerie_Belvedere.jpg'],
  ['blue_horses.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Franz_Marc_-_Die_gro%C3%9Fen_blauen_Pferde_1911.jpg/1280px-Franz_Marc_-_Die_gro%C3%9Fen_blauen_Pferde_1911.jpg'],
  ['sleeping_gypsy.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/WLA_moma_Henri_Rousseau_The_Sleeping_Gypsy.jpg/1280px-WLA_moma_Henri_Rousseau_The_Sleeping_Gypsy.jpg'],
  ['nighthawks.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg'],
  ['sunday_morning_hopper.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Early-sunday-morning-edward-hopper-1930.jpg/1280px-Early-sunday-morning-edward-hopper-1930.jpg'],
  ['madonna_munch.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Edvard_Munch_-_Madonna_%281894-1895%29.jpg/800px-Edvard_Munch_-_Madonna_%281894-1895%29.jpg'],
  ['childs_bath_cassatt.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg/800px-Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg'],
  ['morisot_summer.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Berthe_Morisot_-_Jour_d%27%C3%A9t%C3%A9%2C_1879.jpg/1024px-Berthe_Morisot_-_Jour_d%27%C3%A9t%C3%A9%2C_1879.jpg'],
  ['origin_world.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Courbet_Origine_du_monde.jpg/800px-Courbet_Origine_du_monde.jpg'],
  ['boating_manet.jpg','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Edouard_Manet_-_Boating_-_Metropolitan_Museum_of_Art.jpg/1024px-Edouard_Manet_-_Boating_-_Metropolitan_Museum_of_Art.jpg'],
];

function download(src, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = src.startsWith('https') ? https : http;
    const req = get.get(src, { headers: { 'User-Agent': 'meiga-bot/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', e => { fs.existsSync(dest) && fs.unlinkSync(dest); reject(e); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

(async () => {
  let ok = 0, ng = [];
  for (const [file, src] of PAINTINGS) {
    const dest = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(dest)) { console.log(`SKIP ${file}`); ok++; continue; }
    try {
      await download(src, dest);
      console.log(`OK   ${file}`);
      ok++;
    } catch(e) {
      console.error(`NG   ${file}: ${e.message}`);
      ng.push(file);
    }
  }
  console.log(`\n完了: ✅${ok} ❌${ng.length}`);
  if (ng.length) console.log('NG:', ng.join(', '));
  process.exit(ng.length > 10 ? 1 : 0);
})();
