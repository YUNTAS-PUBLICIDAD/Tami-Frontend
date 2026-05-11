<?php
$html = '<strong>INICIO</strong><br><span class="x">texto</span><br><strike>FINAL</strike>';

$text = preg_replace_callback('/<(?:b|strong)\b[^>]*>(.*?)<\/(?:b|strong)>/is', function($matches) {
    return " *{$matches[1]}* ";
}, $html);

$text = preg_replace_callback('/<(?:i|em)\b[^>]*>(.*?)<\/(?:i|em)>/is', function($matches) {
    return " _{$matches[1]}_ ";
}, $text);

$text = preg_replace_callback('/<(?:s|strike|del)\b[^>]*>(.*?)<\/(?:s|strike|del)>/is', function($matches) {
    return " ~{$matches[1]}~ ";
}, $text);

echo $text;
