import { Version } from '@microsoft/sp-core-library';
// ★ PropertyPaneTextField をインポート
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField // これを追加（または確認）
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// import type { IReadonlyTheme } from '@microsoft/sp-component-base'; // (不要ならコメントアウト or 削除)
// import styles from './QualityManualViewerWebPart.module.scss'; // (もし使わないならコメントアウト or 削除)
import * as strings from 'QualityManualViewerWebPartStrings';

// ★ プロパティのインターフェース定義を修正 ★
export interface IQualityManualViewerWebPartProps {
  description: string; // 例として残す場合
  htmlFileUrl: string; // HTMLファイルのURL用プロパティを追加
  cssFileUrl: string;  // CSSファイルのURL用プロパティを追加
}

export default class QualityManualViewerWebPart extends BaseClientSideWebPart<IQualityManualViewerWebPartProps> {

  // private _isDarkTheme: boolean = false; // (テーマ関連、もし使わないならコメントアウト or 削除)
  // private _environmentMessage: string = ''; // (環境メッセージ、もし使わないならコメントアウト or 削除)

  public render(): void {

    // ★ プロパティからURLを取得 ★
    const htmlFileUrl = this.properties.htmlFileUrl;
    const cssFileUrl = this.properties.cssFileUrl;

    // Webパーツの表示領域をクリア (デフォルトのHTMLなどが残らないように)
    this.domElement.innerHTML = '';

    // ★ URLが設定されていない場合のメッセージ表示 ★
    if (!htmlFileUrl || !cssFileUrl) {
      this.domElement.innerHTML = `
        <div style="border: 1px dashed #ccc; padding: 10px; margin: 10px;">
          Webパーツの設定 (鉛筆アイコン) を開き、<br>
          「HTMLファイルのURL」と「CSSファイルのURL」を指定してください。
        </div>`;
      return; // URLがなければここで処理を終了
    }

    // --- fetch 処理 ---
    // まずCSSを読み込む
    fetch(cssFileUrl)
      .then(response => {
        if (!response.ok) {
          // レスポンスがエラーの場合、詳細を含めてエラーを投げる
          throw new Error(`CSSファイルの取得に失敗 (${response.status} ${response.statusText})`);
        }
        return response.text(); // レスポンスボディをテキストとして取得
      })
      .then(cssText => {
        // 取得したCSSテキストを<style>タグで<head>に追加
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(cssText));
        // 既存の同じスタイルの重複を防ぐためにIDを付与(オプション)
        styleElement.id = `custom-css-${this.instanceId}`;
        // 既存のスタイルがあれば削除してから追加
        const existingStyle = document.getElementById(styleElement.id);
        if (existingStyle) {
            existingStyle.remove();
        }
        document.head.appendChild(styleElement);

        // CSSの読み込みが終わったらHTMLを読み込む
        return fetch(htmlFileUrl);
      })
      .then(response => {
        if (!response.ok) {
          // レスポンスがエラーの場合、詳細を含めてエラーを投げる
          throw new Error(`HTMLファイルの取得に失敗 (${response.status} ${response.statusText})`);
        }
        return response.text(); // レスポンスボディをテキストとして取得
      })
      .then(htmlText => {
        // 取得したHTMLテキストをWebパーツのDOM要素に挿入
        this.domElement.innerHTML = htmlText;
      })
      .catch(error => {
        // エラーハンドリング: コンソールにエラーを出力し、Webパーツ内にメッセージ表示
        console.error(`[QualityManualViewer] コンテンツ読み込みエラー:`, error);
        this.domElement.innerHTML = `
          <div style="color: red; border: 1px solid red; padding: 10px; margin: 10px;">
            <b>エラーが発生しました</b><br>
            コンテンツの読み込みに失敗しました。<br>
            詳細: ${error.message}<br>
            Webパーツの設定でURLが正しいか確認してください。
          </div>`;
      });
  }

  // onInitメソッド (もし環境メッセージなどを使わないなら、このメソッド自体不要な場合もある)
  // protected onInit(): Promise<void> {
  //   return this._getEnvironmentMessage().then(message => {
  //     this._environmentMessage = message;
  //   });
  // }

  // 環境メッセージ取得 (もし使わないなら不要)
  // private _getEnvironmentMessage(): Promise<string> {
  //   if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
  //     return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
  //       .then(context => {
  //         let environmentMessage: string = '';
  //         switch (context.app.host.name) {
  //           case 'Office': // running in Office
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
  //             break;
  //           case 'Outlook': // running in Outlook
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
  //             break;
  //           case 'Teams': // running in Teams
  //           case 'TeamsModern':
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
  //             break;
  //           default:
  //             environmentMessage = strings.UnknownEnvironment;
  //         }
  //         return environmentMessage;
  //       });
  //   }
  //   return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  // }

  // テーマ変更時の処理 (もし使わないなら不要)
  // protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
  //   if (!currentTheme) {
  //     return;
  //   }
  //   this._isDarkTheme = !!currentTheme.isInverted;
  //   const {
  //     semanticColors
  //   } = currentTheme;

  //   if (semanticColors) {
  //     this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
  //     this.domElement.style.setProperty('--link', semanticColors.link || null);
  //     this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
  //   }
  // }

  // このWebパーツのバージョン情報
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // ★ プロパティウィンドウ（設定パネル）の構成 ★
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Webパーツの表示設定" // パネル上部の説明
          },
          groups: [
            {
              groupName: "コンテンツURL設定", // グループ名
              groupFields: [
                // descriptionプロパティ用のフィールド (もし残すなら)
                // PropertyPaneTextField('description', {
                //   label: strings.DescriptionFieldLabel
                // }),
                // ★ HTMLファイルURL用の入力フィールドを追加 ★
                PropertyPaneTextField('htmlFileUrl', {
                  label: "HTMLファイルのURL", // 画面に表示されるラベル
                  description: "表示するHTMLファイルが保存されているSharePoint上のURLを指定します。", // フィールドの説明
                  multiline: true, // 複数行入力を許可 (長いURL用)
                  resizable: true, // サイズ変更を許可
                  placeholder: "https://..." // 入力例のプレースホルダー
                }),
                // ★ CSSファイルURL用の入力フィールドを追加 ★
                PropertyPaneTextField('cssFileUrl', {
                  label: "CSSファイルのURL",  // 画面に表示されるラベル
                  description: "適用するCSSファイルが保存されているSharePoint上のURLを指定します。", // フィールドの説明
                  multiline: true,
                  resizable: true,
                  placeholder: "https://..."
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
