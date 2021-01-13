using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

using Jumoo.TranslationManager.Core.Extensions;
using Jumoo.TranslationManager.Core.Models;
using Jumoo.TranslationManager.LinkUpdater;
using Jumoo.TranslationManager.LinkUpdater.LinkMappers;
using Localization.Xliff.OM.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Core.Services;

namespace Jumoo.TranslationManager.ContentBlocks
{
    public class ContentBlocksLinkMapper : LinkMapperNestedBase, ILinkMapper
    {
        private readonly string docTypeKeyAlias = "ncContentTypeAlias";
        public readonly IContentTypeService contentTypeService;

        public ContentBlocksLinkMapper(
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            LinkResolver linkResolver) : base(dataTypeService, linkResolver)
        {
            this.contentTypeService = contentTypeService;
        }

        public string Name => "ContentBlocks Link Mapper";

        public string[] Editors => new string[]
        {
            "Perplex.ContentBlocks"
        };

        public object UpdateLinkValues(TranslationSet set, int targetSiteId, object sourceValue, object targetValue)
        {
            if (set == null || sourceValue == null || targetValue == null) return targetValue;

            var sourceJson = GetJson(sourceValue);
            var targetJson = GetJson(targetValue);

            if (sourceJson == null || targetJson == null) return targetValue;

            if (sourceJson.ContainsKey("header")
                && targetJson.ContainsKey("header")) {

                var sourceBlock = sourceJson.Value<JObject>("header");
                var targetBlock = targetJson.Value<JObject>("header");

                var result = GetBlockLinks(sourceBlock, targetBlock, set, targetSiteId);
                if (result != null)
                {
                    targetJson["header"] = result;
                }
            }

            if (sourceJson.ContainsKey("blocks")
                && targetJson.ContainsKey("blocks"))
            {
                var sourceBlocks = sourceJson.Value<JArray>("blocks");
                var targetBlocks = targetJson.Value<JArray>("blocks");

                var commonBlockCount = Math.Min(sourceBlocks.Count, targetBlocks.Count);
                for(var b = 0; b < commonBlockCount; b++)
                {
                    var result = GetBlockLinks(sourceBlocks[b] as JObject, targetBlocks[b] as JObject, set, targetSiteId);
                    if (result != null)
                    {
                        targetBlocks[b] = result;
                    }
                }
            }
            return JsonConvert.SerializeObject(targetJson, Formatting.Indented);
        }

        private JObject GetBlockLinks(JObject sourceBlock, JObject targetBlock, TranslationSet set, int targetSiteId)
        {
            var sourceContent = sourceBlock.Value<JArray>("content");
            var targetContent = targetBlock.Value<JArray>("content");

            var contentCount = Math.Min(sourceContent.Count, targetContent.Count);

            for(int c = 0; c < contentCount; c++)
            {
                var source = sourceContent[c] as JObject;
                var target = targetContent[c] as JObject;

                var result = ProcessLinkValue(
                    source,
                    target,
                    set,
                    targetSiteId);


                if (result != null)
                {
                    targetContent[c] = result;
                }
            }

            targetBlock["content"] = targetContent;
            return targetBlock;
        }
       
        /// <summary>
        ///  Turn the object we get passed into a json object
        /// </summary>
        /// <remarks>
        ///  Depending on where our property is nested this could be json
        ///  or a string representation of json, so we convert to a string
        ///  then into the json, just to be sure we get what we want.
        /// </remarks>
        private JObject GetJson(object value)
        {
            if (value == null) return null;

            var stringValue = value.TryConvertTo<string>();
            if (!stringValue.Success) return null;

            if (!stringValue.Result.DetectIsJson()) return null;

            return JsonConvert.DeserializeObject<JObject>(stringValue.Result);
        }

        protected override IContentType GetDocType(JObject item)
            => contentTypeService.GetDocTypeByKey(item, this.docTypeKeyAlias);

        protected override JObject GetJsonObject(JObject item)
            => item;
    }
}
