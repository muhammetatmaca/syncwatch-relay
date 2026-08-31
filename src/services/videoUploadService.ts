import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface UploadResult {
  success: boolean;
  videoUrl?: string;
  videoTitle?: string;
  error?: string;
}

export async function pickAndUploadVideo(
  onProgress?: (status: string) => void
): Promise<UploadResult> {
  try {
    // 1. Request Permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Galeriden video seçebilmek için medya erişim izni vermeniz gerekmektedir.'
      );
      return { success: false, error: 'Permission denied' };
    }

    // 2. Launch Video Picker
    onProgress?.('Video seçiliyor...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: 'Canceled' };
    }

    const asset = result.assets[0];
    const fileUri = asset.uri;
    const fileName = asset.fileName || `video_${Date.now()}.mp4`;

    onProgress?.('Video buluta yükleniyor (Catbox)...');

    // 3. Prepare Multipart Form Data
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', {
      uri: fileUri,
      name: fileName,
      type: 'video/mp4',
    } as any);

    // 4. Upload to Catbox API
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const uploadedUrl = (await response.text()).trim();

    if (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://')) {
      onProgress?.('Yükleme tamamlandı!');
      return {
        success: true,
        videoUrl: uploadedUrl,
        videoTitle: fileName.replace(/\.[^/.]+$/, ''),
      };
    } else {
      throw new Error(uploadedUrl || 'Sunucudan geçersiz yanıt alındı');
    }
  } catch (err: any) {
    console.error('[VideoUpload] Error:', err);
    return {
      success: false,
      error: err.message || 'Video yüklenirken bir hata oluştu.',
    };
  }
}
